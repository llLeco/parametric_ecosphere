import { Socket, io } from 'socket.io-client';
import { LoggerHelper } from '@hsuite/helpers';

/**
 * Web3Socket class for managing WebSocket connections to Hedera network services
 * 
 * This class provides a standardized interface for establishing and maintaining
 * WebSocket connections to Hedera network endpoints. It handles connection setup,
 * authentication, event handling, and provides access to the underlying socket instance.
 * 
 * @class Web3Socket
 * @description Manages WebSocket connections to Hedera network services with authentication and event handling
 * @example
 * // Create a new Web3Socket instance
 * const socket = new Web3Socket(
 *   'https://api.example.com',
 *   'transactions',
 *   'your-access-token'
 * );
 * 
 * // Get the socket instance to listen for events
 * const socketInstance = socket.getSocket();
 * socketInstance.on('transaction', (data) => {
 *   console.log('New transaction:', data);
 * });
 */
export class Web3Socket {
  /**
   * Logger instance for logging connection events and errors
   * @private
   * @type {LoggerHelper}
   * @description Provides structured logging for socket connection events
   */
  private logger: LoggerHelper = new LoggerHelper(Web3Socket.name);

  /**
   * Authentication token for securing the WebSocket connection
   * @private
   * @type {string}
   * @description JWT or other token format used for authenticating with the WebSocket server
   */
  private accessToken: string;

  /**
   * Socket.io client instance that manages the WebSocket connection
   * @private
   * @type {Socket}
   * @description The underlying Socket.io client instance handling the connection
   */
  private socket: Socket;

  /**
   * Base URL of the WebSocket server
   * @private
   * @type {string}
   * @description The server URL (http/https) that will be converted to WebSocket protocol (ws/wss)
   */
  private url: string;

  /**
   * Topic or namespace for the WebSocket connection
   * @private
   * @type {string}
   * @description Identifies the specific service or event stream to connect to on the server
   */
  private topic: string;

  /**
   * Creates a new Web3Socket instance and initializes the connection
   * 
   * @constructor
   * @param {string} url - Base URL of the WebSocket server (http/https format)
   * @param {string} topic - Topic or namespace to connect to on the server
   * @param {string} accessToken - Authentication token for securing the connection
   * 
   * @description Initializes a new WebSocket connection with the provided parameters.
   * The URL will be automatically converted from HTTP/HTTPS to WS/WSS protocol.
   */
  constructor(
    url: string,
    topic: string,
    accessToken: string
  ) {
    this.url = url;
    this.topic = topic;
    this.accessToken = accessToken;
    this.socket = this.init();
  }

  /**
   * Initializes the WebSocket connection with proper configuration
   * 
   * @private
   * @returns {Socket} Configured Socket.io client instance
   * 
   * @description Sets up the Socket.io connection with appropriate transport options,
   * authentication, and event handlers. Converts HTTP/HTTPS URLs to WS/WSS protocol.
   */
  private init() {
    let socketUrl = this.url.replace('https://', 'wss://').replace('http://', 'ws://');

    this.socket = io(`${socketUrl}/${this.topic}`, {
      upgrade: false,
      transports: ["websocket"],
      auth: {
        accessToken: this.accessToken
      }
    });

    this.socket.on("connect", async () => {
      this.logger.verbose(`Connected to socket.`);
    });

    this.socket.on("disconnect", async (event) => {
      this.logger.verbose(`Disconnected from socket.`);
    });

    return this.socket;
  }

  /**
   * Retrieves the active Socket.io client instance
   * 
   * @public
   * @returns {Socket} The active Socket.io client instance
   * 
   * @description Provides access to the underlying Socket.io client instance,
   * allowing consumers to register custom event handlers or emit events.
   * 
   * @example
   * const socket = new Web3Socket(url, topic, token);
   * const socketInstance = socket.getSocket();
   * 
   * // Listen for custom events
   * socketInstance.on('customEvent', (data) => {
   *   console.log('Custom event received:', data);
   * });
   * 
   * // Emit events to the server
   * socketInstance.emit('clientEvent', { message: 'Hello server' });
   */
  getSocket() {
    return this.socket;
  };
}