import { CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'success', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Délai pour l'animation de sortie
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`notification ${type} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="notification-content">
        <CheckCircle size={20} className="notification-icon" />
        <span className="notification-message">{message}</span>
        <button onClick={handleClose} className="notification-close">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Notification;