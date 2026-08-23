import React from "react";
import {
  Modal as NativeModal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

type ViewProps = React.ComponentProps<typeof View>;
type ModalProps = React.ComponentProps<typeof NativeModal> & {
  isOpen?: boolean;
  onClose?: () => void;
};

function Root({ isOpen, onClose, children, ...props }: ModalProps) {
  return (
    <NativeModal
      {...props}
      visible={isOpen}
      onRequestClose={onClose}
      transparent
      animationType="fade"
    >
      {children}
    </NativeModal>
  );
}

function Content(props: ViewProps) {
  return <View {...props} style={[styles.content, props.style]} />;
}
function Header(props: ViewProps) {
  return <View {...props} style={[styles.header, props.style]} />;
}
function Footer(props: ViewProps) {
  return <View {...props} style={[styles.footer, props.style]} />;
}
function Body(props: ViewProps) {
  return <View {...props} style={[styles.body, props.style]} />;
}
function Backdrop({ style, ...props }: React.ComponentProps<typeof Pressable>) {
  return (
    <Pressable
      {...props}
      style={(state) => [
        styles.backdrop,
        typeof style === "function" ? style(state) : style,
      ]}
    />
  );
}

export const Modal = Object.assign(Root, {
  Backdrop,
  Content,
  Header,
  Body,
  Footer,
  CloseButton: Pressable,
});
export const ModalBackdrop = Backdrop;
export const ModalContent = Content;
export const ModalHeader = Header;
export const ModalBody = Body;
export const ModalFooter = Footer;
export const ModalClose = Pressable;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(7, 17, 31, 0.55)",
  },
  content: { alignSelf: "center", margin: "auto", overflow: "hidden" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  body: { paddingHorizontal: 20, paddingVertical: 4 },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 20,
  },
});
