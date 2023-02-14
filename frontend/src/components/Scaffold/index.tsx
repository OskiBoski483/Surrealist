import classes from './style.module.scss';
import surrealistLogo from '~/assets/icon.png';
import { ActionIcon, Box, Button, Center, Divider, Group, Image, Modal, Paper, Select, SimpleGrid, Stack, Text, TextInput, Title, useMantineTheme } from "@mantine/core";
import { Spacer } from "../Spacer";
import { actions, store, useStoreValue } from '~/store';
import { useStable } from '~/hooks/stable';
import { uid } from 'radash';
import { MouseEvent, PropsWithChildren, useEffect, useState } from 'react';
import { updateConfig, updateTitle } from '~/util/helpers';
import { TabBar } from '../TabBar';
import { Form } from '../Form';
import { useImmer } from 'use-immer';
import { getSurreal, openSurreal, SurrealConnection } from '~/surreal';
import { useActiveTab, useTabCreator } from '~/hooks/tab';
import { showNotification } from '@mantine/notifications';
import { useIsLight } from '~/hooks/theme';
import { mdiClose, mdiConsole, mdiGraph, mdiLightningBolt, mdiNetwork, mdiTable } from '@mdi/js';
import { Icon } from '../Icon';
import { Splitter } from '../Splitter';
import { ConsolePane } from '../ConsolePane';
import { QueryView } from '~/query/QueryView';
import { ExplorerView } from '~/explorer/ExplorerView';
import { AuthMode, ViewMode } from '~/typings';
import { VisualizerView } from '~/visualizer/VisualizerView';
import { useHotkeys } from '@mantine/hooks';

const AUTH_MODES = [
	{ label: 'Root authentication', value: 'root' },
	{ label: 'Namespace authentication', value: 'namespace' },
	{ label: 'Database authentication', value: 'database' },
	{ label: 'Scope authentication', value: 'scope' },
	{ label: 'Anonymous', value: 'none' }
];

const VIEW_MODES: Record<ViewMode, any> = {
	query: {
		name: 'Query',
		icon: mdiLightningBolt
	},
	explorer: {
		name: 'Explorer',
		icon: mdiTable
	},
	visualizer: {
		name: 'Visualizer',
		icon: mdiGraph
	}
}

function ViewSlot(props: PropsWithChildren<{ visible: boolean }>) {
	return (
		<div style={{ display: props.visible ? 'initial' : 'none' }}>
			{props.children}
		</div>
	)
}

export function Scaffold() {
	const isLight = useIsLight();
	const theme = useMantineTheme();
	const activeTab = useStoreValue(state => state.activeTab);
	const autoConnect = useStoreValue(state => state.config.autoConnect);
	const servePending = useStoreValue(state => state.servePending);
	const isServing = useStoreValue(state => state.isServing);
	const enableConsole = useStoreValue(state => state.config.enableConsole);
	const viewMode = useStoreValue(state => state.viewMode);
	const createTab = useTabCreator();
	const tabInfo = useActiveTab();

	const [isOnline, setIsOnline] = useState(false);
	const [isConnecting, setIsConnecting] = useState(false);

	const createNewTab = useStable(async () => {
		const tabId = createTab('New tab');

		store.dispatch(actions.setActiveTab(tabId));

		updateTitle();
		await updateConfig();
	});

	const [ editingInfo, setEditingInfo ] = useState(false);
	const [ infoDetails, setInfoDetails ] = useImmer<SurrealConnection>({
		endpoint: '',
		namespace: '',
		database: '',
		username: '',
		password: '',
		authMode: 'root',
		scope: ''
	});

	const openInfoEditor = useStable(() => {
		setEditingInfo(true);
		setInfoDetails(tabInfo!.connection);
	});

	const closeEditingInfo = useStable(() => {
		setEditingInfo(false);
	});

	const openConnection = useStable((e?: MouseEvent, silent?: boolean) => {
		e?.stopPropagation();

		if (isConnecting) {
			return;
		}

		const activeTab = store.getState().activeTab;
		const tabInfo = store.getState().config.tabs.find(tab => tab.id === activeTab);

		if (!tabInfo) {
			return;
		}

		openSurreal({
			connection: tabInfo.connection,
			onConnect() {
				setIsConnecting(false);
				setIsOnline(true)
			},
			onDisconnect(code, reason) {
				setIsConnecting(false);
				setIsOnline(false);

				if (code != 1000 && !silent) {
					const subtitle = code === 1006
						? 'Unexpected connection close'
						: reason || `Unknown reason`;

					showNotification({
						disallowClose: true,
						color: 'red.4',
						bg: 'red.6',
						message: (
							<div>
								<Text color="white" weight={600}>Connection Closed</Text>
								<Text color="white" opacity={0.8} size="sm">{subtitle} ({code})</Text>
							</div>
						)
					});
				}
			},
			// onError(err) {
			// 	showNotification({
			// 		disallowClose: true,
			// 		color: 'red.4',
			// 		bg: 'red.6',
			// 		message: (
			// 			<div>
			// 				<Text color="white" weight={600}>Connection Error</Text>
			// 				<Text color="white" opacity={0.8} size="sm">{err}</Text>
			// 			</div>
			// 		)
			// 	});
			// },
		});

		setIsConnecting(true);
	});

	const sendQuery = useStable(async (override?: string) => {
		if (viewMode !== 'query') {
			return;
		}

		if (!isOnline) {
			showNotification({
				message: 'You must be connected to send a query',
			});
			return;
		}

		const { query, name } = tabInfo!;
		const variables = tabInfo!.variables ? JSON.parse(tabInfo!.variables) : undefined;

		try {
			const response = await getSurreal()?.query(override?.trim() || query, variables);

			store.dispatch(actions.updateTab({
				id: activeTab!,
				lastResponse: response
			}));
		} catch(err: any) {
			store.dispatch(actions.updateTab({
				id: activeTab!,
				lastResponse: [{
					status: 'ERR',
					detail: err.message
				}]
			}));
		}

		store.dispatch(actions.addHistoryEntry({
			id: uid(5),
			query: query,
			tabName: name,
			timestamp: Date.now()
		}));

		await updateConfig();
	});

	const saveInfo = useStable(async () => {
		store.dispatch(actions.updateTab({
			id: activeTab!,
			connection: {
				...infoDetails
			}
		}));

		if (isOnline) {
			getSurreal()?.close();
		}

		await updateConfig();
		closeEditingInfo();

		if (autoConnect) {
			openConnection();
		}
	});

	const closeConnection = useStable((e?: MouseEvent) => {
		e?.stopPropagation();
		getSurreal()?.close();
		setIsConnecting(false);
		setIsOnline(false);
	});

	const toggleViewMode = useStable(() => {
		const newMode = viewMode === 'query' ? 'explorer' : viewMode == 'visualizer' ? 'query' : 'visualizer';

		store.dispatch(actions.setViewMode(newMode));
		updateTitle();
	});

	useEffect(() => {
		if (autoConnect) {
			openConnection(undefined, true);
		}
	}, [autoConnect, activeTab]);

	const revealConsole = useStable((e: MouseEvent) => {
		e.stopPropagation();
		store.dispatch(actions.setConsoleEnabled(true));
	});

	useHotkeys([
		['ctrl+q', () => {
			store.dispatch(actions.setViewMode('query'));
			updateTitle();
		}],
		['ctrl+e', () => {
			store.dispatch(actions.setViewMode('explorer'));
			updateTitle();
		}],
	], []);

	useHotkeys([
		['F9', () => sendQuery()],
		['mod+Enter', () => sendQuery()],
	]);

	const connectionSaveDisabled = !infoDetails.endpoint || !infoDetails.namespace || !infoDetails.database || !infoDetails.username || !infoDetails.password;
	const showConsole = enableConsole && (servePending || isServing);
	const borderColor = theme.fn.themeColor(isOnline ? 'surreal' : 'light');
	const viewInfo = VIEW_MODES[viewMode];

	const handleSendQuery = useStable((e: MouseEvent) => {
		e.stopPropagation();
		sendQuery();
	});

	return (
		<div className={classes.root}>
			<TabBar
				viewMode={viewMode}
				openConnection={openConnection}
				closeConnection={closeConnection}
				onCreateTab={createNewTab}
				onSwitchTab={closeConnection}
			/>

			{activeTab ? (
				<>
					<Group p="xs">
						<Button
							px="lg"
							h="100%"
							variant="gradient"
							color="surreal.4"
							onClick={toggleViewMode}
							title={`Switch to ${viewInfo.name} View`}
						>
							<Icon
								path={viewInfo.icon}
								left
							/>
							{viewInfo.name}
						</Button>
						<Paper
							className={classes.input}
							onClick={openInfoEditor}
							style={{ borderColor: borderColor }}
						>
							{!isOnline ? (
								<Paper
									bg="light"
									px="xs"
								>
									<Text
										color="white"
										size="xs"
										py={2}
										weight={600}
									>
										OFFLINE
									</Text>
								</Paper>
							) : (
								<Paper
									bg={isLight ? 'light.0' : 'light.6'}
									c={isLight ? 'light.6' : 'white'}
									px="xs"
								>
									{tabInfo!.connection.username}
								</Paper>
							)}
							<Text color={isLight ? 'light.6' : 'white'}>
								{tabInfo!.connection.endpoint}
							</Text>
							<Spacer />
							{(servePending || isServing) && !showConsole && (
								<ActionIcon
									onClick={revealConsole}
									title="Reveal console"
								>
									<Icon color="light.4" path={mdiConsole} />
								</ActionIcon>
							)}
							{isOnline && (
								<ActionIcon
									onClick={closeConnection}
									title="Disconnect"
								>
									<Icon color="light.4" path={mdiClose} />
								</ActionIcon>
							)}
							{!isOnline ? (
								<Button
									color="light"
									style={{ borderRadius: 0 }}
									onClick={openConnection}
								>
									{isConnecting ? 'Connecting...' : 'Connect'}
								</Button>
							) : viewMode == 'query' ? (
								<Button
									color="surreal"
									onClick={handleSendQuery}
									className={classes.sendButton}
									title="Send Query (F9)"
								>
									Send Query
								</Button>
							) : (
								<div />
							)}
						</Paper>
					</Group>

					<Box p="xs" className={classes.content}>
						<Splitter
							minSize={100}
							bufferSize={53}
							direction="vertical"
							endPane={showConsole && (
								<ConsolePane />
							)}
						>
							<ViewSlot visible={viewMode == 'query'}>
								<QueryView
									isOnline={isOnline}
									sendQuery={sendQuery}
								/>
							</ViewSlot>

							<ViewSlot visible={viewMode == 'explorer'}>
								<ExplorerView
									isOnline={isOnline}
								/>
							</ViewSlot>

							<ViewSlot visible={viewMode == 'visualizer'}>
								<VisualizerView
									isOnline={isOnline}
								/>
							</ViewSlot>
						</Splitter>
					</Box>
				</>
			) : (
				<Center h="100%">
					<div>
						<Image
							className={classes.emptyImage}
							src={surrealistLogo}
							width={120}
							mx="auto"
						/>
						<Title color="light" align="center" mt="md">
							Surrealist
						</Title>
						<Text color="light.2" align="center">
							Open or create a new tab to continue
						</Text>
						<Center mt="lg">
							<Button size="xs" onClick={createNewTab}>
								Create tab
							</Button>
						</Center>
					</div>
				</Center>
			)}

			{/* ANCHOR Connection details modal */}
			<Modal
				opened={editingInfo}
				onClose={closeEditingInfo}
				size="lg"
				title={
					<Title size={16} color={isLight ? 'light.6' : 'white'}>
						Connection details
					</Title>
				}
			>
				<Form onSubmit={saveInfo}>
					<SimpleGrid cols={2} spacing="xl">
						<Stack>
							<TextInput
								required
								label="Endpoint URL"
								value={infoDetails.endpoint}
								onChange={(e) => setInfoDetails(draft => {
									draft.endpoint = e.target.value
								})}
								autoFocus
							/>
							<TextInput
								required
								label="Namespace"
								value={infoDetails.namespace}
								onChange={(e) => setInfoDetails(draft => {
									draft.namespace = e.target.value
								})}
							/>
							<TextInput
								required
								label="Database"
								value={infoDetails.database}
								onChange={(e) => setInfoDetails(draft => {
									draft.database = e.target.value
								})}
							/>
						</Stack>
						<Stack>
							<Select
								label="Authentication mode"
								value={infoDetails.authMode}
								onChange={(value) => setInfoDetails(draft => {
									draft.authMode = value as AuthMode;
								})}
								data={AUTH_MODES}
							/>
							<TextInput
								label="Username"
								disabled={infoDetails.authMode == 'none'}
								required={infoDetails.authMode != 'none'}
								value={infoDetails.username}
								onChange={(e) => setInfoDetails(draft => {
									draft.username = e.target.value
								})}
							/>
							<TextInput
								label="Password"
								disabled={infoDetails.authMode == 'none'}
								required={infoDetails.authMode != 'none'}
								value={infoDetails.password}
								onChange={(e) => setInfoDetails(draft => {
									draft.password = e.target.value
								})}
							/>
							<TextInput
								label="Scope"
								disabled={infoDetails.authMode != 'scope'}
								required={infoDetails.authMode == 'scope'}
								value={infoDetails.scope}
								onChange={(e) => setInfoDetails(draft => {
									draft.scope = e.target.value
								})}
							/>
						</Stack>
					</SimpleGrid>
					<Group mt="lg">
						<Button
							color={isLight ? 'light.5' : 'light.3'}
							variant="light"
							onClick={closeEditingInfo}
						>
							Close
						</Button>
						<Spacer />
						<Button
							disabled={connectionSaveDisabled}
							type="submit"
						>
							Save details
						</Button>
					</Group>
				</Form>
			</Modal>
		</div>
	)
}
