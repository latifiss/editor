import { useState } from "react";

interface UseNotificationModalReturn {
  modalOpen: boolean;
  close: () => void;
  open: () => void;
}

const useNotificationModal = (): UseNotificationModalReturn => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const close = () => setModalOpen(false);
  const open = () => setModalOpen(true);

  return { modalOpen, close, open };
};

export default useNotificationModal;
