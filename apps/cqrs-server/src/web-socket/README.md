# WebSocket Session-Based System

This WebSocket implementation uses a session-based approach where rooms persist across disconnections and users are identified by persistent sessionIds.

## Key Concepts

### Session-Based Identity
- **sessionId**: A persistent UUID that identifies a user across reconnections
- **clientId**: The socket connection ID (changes on every connection)
- **Rooms persist**: Rooms are never deleted when users disconnect

### Roles (Automatic Assignment)

### WebSocketProfile.HOST
- **Automatically assigned** to the user who creates a room
- Provides both `roomId` and `sessionId` when creating
- Can perform administrative actions in their room
- Can execute `hostAction` events
- **When HOST disconnects**: Marked as disconnected with timestamp, room remains active

### WebSocketProfile.GUEST
- **Automatically assigned** to users who join existing rooms
- Provides only `sessionId` when joining (room must exist)
- Cannot perform administrative actions
- Limited to basic room participation
- **When GUEST disconnects**: Marked as disconnected with timestamp, room remains active

## WebSocket Events

### Creating a Room (HOST)
```typescript
// Client sends (HOST provides both roomId and sessionId)
const roomId = generateUUID();
const sessionId = generateUUID(); // Store this persistently
socket.emit("createRoom", { roomId, sessionId });

// Server responds
socket.on("roomCreated", (data) => {
  // data: { roomId: string, clientId: string, sessionId: string, profile: "host" }
});
```

### Joining a Room (GUEST)
```typescript
// Client sends (GUEST provides only sessionId, room must exist)
const sessionId = getStoredSessionId(); // From localStorage/storage
socket.emit("joinRoom", { roomId: "existing-room-id", sessionId });

// Server responds
socket.on("roomJoined", (data) => {
  // data: { roomId: string, clientId: string, sessionId: string, profile: "guest" }
});

// Other participants are notified
socket.on("newParticipant", (data) => {
  // data: { clientId: string, sessionId: string, profile: "guest" }
});
```

### Reconnection (Both HOST and GUEST)
```typescript
// Client sends on reconnection (page reload, network reconnect)
const sessionId = getStoredSessionId();
socket.emit("reconnect", { sessionId });

// Server responds
socket.on("reconnected", (data) => {
  // data: { roomId: string, clientId: string, sessionId: string, profile: "host"|"guest" }
});

// Other participants are notified
socket.on("participantReconnected", (data) => {
  // data: { sessionId: string, clientId: string, profile: string, reconnectedAt: Date }
});
```

### Disconnection (Both HOST and GUEST)
```typescript
// All participants receive when someone disconnects
socket.on("participantDisconnected", (data) => {
  // data: { sessionId: string, profile: "host"|"guest", disconnectedAt: Date }
});
```

### Manual Leave Room
```typescript
// Client sends
socket.emit("leaveRoom", { roomId: "room-id" });

// Server responds
socket.on("roomLeft", (data) => {
  // data: { roomId: string, clientId: string }
});
```

## REST API Endpoints

### Get All Rooms
```
GET /websocket-rooms
```
Returns all active rooms with detailed profile information:
```json
[
  {
    "roomId": "uuid-room-id",
    "clientIds": ["socket-id-1", "socket-id-2"],
    "participantCount": 2,
    "profiles": [
      {
        "id": "socket-id-1",
        "sessionId": "session-uuid-1",
        "profile": "host",
        "joinedAt": "2025-09-26T10:30:00.000Z",
        "isConnected": true
      },
      {
        "id": "socket-id-2",
        "sessionId": "session-uuid-2", 
        "profile": "guest",
        "joinedAt": "2025-09-26T10:35:00.000Z",
        "disconnectedAt": "2025-09-26T10:40:00.000Z",
        "isConnected": false
      }
    ],
    "hostCount": 1,
    "guestCount": 1
  }
]
```

### Get Room Count
```
GET /websocket-rooms/count
```
Returns: `{ "count": 5 }`

### Get Specific Room Info
```
GET /websocket-rooms/{roomId}
```
Returns detailed information about a specific room, or `null` if not found.

## Error Handling

- Joining non-existent rooms returns: `{ message: "Room does not exist." }`
- GUEST users attempting host actions receive: `{ message: "Only HOST users can perform this action." }`

## Frontend Implementation Guide

### 1. Session Management
```typescript
// Generate and store sessionId persistently
function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('websocket-session-id');
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('websocket-session-id', sessionId);
  }
  return sessionId;
}

// Store roomId for hosts
function storeRoomId(roomId: string) {
  localStorage.setItem('hosted-room-id', roomId);
}

function getHostedRoomId(): string | null {
  return localStorage.getItem('hosted-room-id');
}
```

### 2. Connection Logic
```typescript
const socket = io('ws://localhost:3000/ws');
const sessionId = getOrCreateSessionId();

socket.on('connect', () => {
  // Try to reconnect to existing session first
  socket.emit('reconnect', { sessionId });
});

socket.on('reconnected', (data) => {
  console.log('Reconnected to existing room:', data);
  // Continue with existing room
});

socket.on('error', (error) => {
  // Reconnection failed, handle as new connection
  if (error.message.includes('Cannot reconnect')) {
    handleNewConnection();
  }
});

function handleNewConnection() {
  const hostedRoomId = getHostedRoomId();
  
  if (hostedRoomId) {
    // User was a host, recreate room
    socket.emit('createRoom', { roomId: hostedRoomId, sessionId });
  } else {
    // User was a guest or new user, show join room UI
    showJoinRoomInterface();
  }
}
```

### 3. Disconnection Handling
```typescript
// Handle disconnections gracefully
socket.on('participantDisconnected', (data) => {
  console.log(`${data.profile} ${data.sessionId} disconnected at ${data.disconnectedAt}`);
  // Update UI to show user as offline
  updateUserStatus(data.sessionId, 'offline');
});

socket.on('participantReconnected', (data) => {
  console.log(`${data.profile} ${data.sessionId} reconnected`);
  // Update UI to show user as online
  updateUserStatus(data.sessionId, 'online');
});
```

## Disconnection Logic

1. **Any User Disconnects**: 
   - Profile is marked with `isConnected: false` and `disconnectedAt` timestamp
   - Room continues to exist with all historical data
   - Other participants are notified with `participantDisconnected` event

2. **Reconnection**:
   - Same sessionId can reconnect and resume their role
   - Other participants are notified with `participantReconnected` event
   - All room state and history is preserved

## Architecture

- **WebSocketGateway**: Handles WebSocket events and role validation
- **WebSocketService**: Manages room profiles, role checking, client tracking, and disconnection logic
- **WebSocketRoomsController**: Provides REST API for room information
- **WebSocketProfile**: Enum defining available roles (HOST, GUEST)