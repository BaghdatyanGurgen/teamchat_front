import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../store/auth';

let connection: signalR.HubConnection | null = null;

export function getHubConnection(): signalR.HubConnection {
    if (connection) return connection;

    connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5263/hubs/chat', {
            accessTokenFactory: () => useAuthStore.getState().accessToken ?? '',
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

    return connection;
}