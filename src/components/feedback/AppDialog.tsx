import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalClose,
} from "@/components/ui/modal";
import { Heading } from "@/components/ui/heading";
import { X } from "lucide-react-native";
import type { PropsWithChildren } from "react";

export function AppDialog({
  open,
  title,
  onClose,
  children,
  footer,
}: PropsWithChildren<{
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: React.ReactNode;
}>) {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <ModalBackdrop />
      <ModalContent className="max-h-[85%] w-[92%] max-w-lg rounded-2xl bg-card">
        <ModalHeader>
          <Heading size="lg">{title}</Heading>
          <ModalClose onPress={onClose}>
            <X size={20} />
          </ModalClose>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
}
