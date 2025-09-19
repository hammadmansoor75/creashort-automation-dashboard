import { useState, useEffect, useRef } from 'react';

export function useRealTimeData(endpoint, interval = 30000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (interval > 0) {
      intervalRef.current = setInterval(fetchData, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endpoint, interval]);

  const refresh = () => {
    setLoading(true);
    fetchData();
  };

  return { data, loading, error, refresh };
}

export function useWebSocket(url, options = {}) {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(WebSocket.CONNECTING);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = options.maxReconnectAttempts || 5;

  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(url);
        
        ws.onopen = () => {
          setReadyState(WebSocket.OPEN);
          reconnectAttempts.current = 0;
          if (options.onOpen) options.onOpen();
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          if (options.onMessage) options.onMessage(data);
        };

        ws.onclose = () => {
          setReadyState(WebSocket.CLOSED);
          if (options.onClose) options.onClose();
          
          // Attempt to reconnect
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            reconnectTimeoutRef.current = setTimeout(connect, 1000 * reconnectAttempts.current);
          }
        };

        ws.onerror = (error) => {
          setReadyState(WebSocket.CLOSED);
          if (options.onError) options.onError(error);
        };

        setSocket(ws);
      } catch (error) {
        console.error('WebSocket connection error:', error);
        if (options.onError) options.onError(error);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (socket && readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  return { socket, lastMessage, readyState, sendMessage };
}
