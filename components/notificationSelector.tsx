import { motion } from "framer-motion";
import { useState } from "react";

interface NotificationSelectorProps {
  onAddNotification: (text: string, style: string, position: string) => void;
}

const NotificationSelector: React.FC<NotificationSelectorProps> = ({ onAddNotification }) => {
  const [text, setText] = useState("Awesome job! 🚀");
  const [style, setStyle] = useState("success");
  const [position, setPosition] = useState("bottom");

  const handleText = (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value);
  const handleStyle = (e: React.ChangeEvent<HTMLSelectElement>) => setStyle(e.target.value);
  const handlePosition = (e: React.ChangeEvent<HTMLSelectElement>) => setPosition(e.target.value);

  const handleSubmit = () => {
    onAddNotification(text, style, position); 
  };

  return (
    <div>
      <motion.input
        className="input"
        value={text}
        onChange={handleText}
        placeholder="Add notification text"
      />
      <motion.select className="input" onChange={handleStyle} value={style}>
        <option value="success">✅ Success</option>
        <option value="warning">⚠️ Warning</option>
        <option value="error">🛑 Error</option>
        <option value="light">☀️ Light</option>
        <option value="">🌙 Dark</option>
      </motion.select>
      <motion.select className="input" onChange={handlePosition} value={position}>
        <option value="bottom">👇🏼 Bottom</option>
        <option value="top">☝🏼 Top</option>
      </motion.select>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="add-button"
        onClick={handleSubmit}
      >
        + Stack em up
      </motion.button>
    </div>
  );
};

export default NotificationSelector;
