"use client";

import { motion, Variants } from "framer-motion";

interface NotificationData {
  id: number; 
  text: string;
  style?: "success" | "error" | "warning" | "light" | string;
}

interface NotificationProps {
  notification: NotificationData;
  onClose: () => void;
}

const notificationVariants: Variants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.2,
    transition: { duration: 0.1 },
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.2,
    transition: { ease: "easeOut", duration: 0.15 },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.1 },
  },
};

const Notification = ({ onClose, notification }: NotificationProps) => {
  const { text, style } = notification;

  const getBackgroundClass = () => {
    switch(style) {
      case 'success': return 'bg-gradient-to-br from-[#2dcd99] to-[#2dcd99]';
      case 'error': return 'bg-gradient-to-br from-[#ff596d] to-[#ff596d]';
      case 'warning': return 'bg-gradient-to-br from-[#ffac37] to-[#ff9238]';
      case 'light': return 'bg-gradient-to-br from-[#ffac37] to-[#ff9238]';
      default: return 'bg-gradient-to-br from-[#202121] to-[#292a2d]';
    }
  };

  const getTextColor = () => {
    return style ? 'text-white' : 'text-[#929292]';
  };

  return (
    <motion.li
      className={`
        ${getBackgroundClass()}
        ${getTextColor()}
        rounded-4xl px-6 py-4 my-2 
        flex items-center justify-between 
        w-full cursor-pointer 
        list-none pointer-events-auto 
        shadow-lg bottom-0 left-0 right-0
      `}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      variants={notificationVariants}
      whileHover="hover"
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onClose}
    >
      <h3 className={`${style ? 'text-white' : 'text-[#929292]'} m-0 text-sm font-medium flex-grow`}>
        {text}
      </h3>
      <CloseButton 
        color={style ? "white" : "#929292"} 
        handleClose={onClose} 
      />
    </motion.li>
  );
};

interface CloseButtonProps {
  handleClose: () => void;
  color: string;
}

const CloseButton = ({ handleClose, color }: CloseButtonProps) => (
  <motion.div 
    className="ml-4 cursor-pointer flex items-center justify-center"
    whileHover={{ scale: 1.2 }} 
    onClick={(e) => {
      e.stopPropagation();
      handleClose();
    }}
  >
    <svg className="w-[18px] h-[18px]" viewBox="0 0 23 23">
      <motion.path
        fill="transparent"
        strokeWidth="3"
        strokeLinecap="square"
        stroke={color}
        d="M 3 16.5 L 17 2.5"
      />
      <motion.path
        fill="transparent"
        strokeWidth="3"
        strokeLinecap="square"
        stroke={color}
        d="M 3 2.5 L 17 16.346"
      />
    </svg>
  </motion.div>
);

export default Notification;