import { createContext, useContext, useState, useCallback } from "react";
import InformationModal from "../components/InformationModal";
import { MESSAGE_TYPES, POSITIONS } from "../constants/constants";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(null);

  const showNotification = useCallback(
    ({ message, type = MESSAGE_TYPES.INFO, position = POSITIONS.TOP_RIGHT, duration = 10 }) => {
      setNotifications(_ => ({ message, messageType: type, position, duration }));
    },
    []
  );

  const hideNotification = () => setNotifications(null);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}

      {notifications && 
      <InformationModal
        message={notifications.message}
        messageType={notifications.messageType}
        position={notifications.position}
        duration={notifications.duration}
        hide={hideNotification}
      />
      }
    </NotificationContext.Provider>
  );
};
