import React from "react";
import { createModal } from "@gluestack-ui/core/modal/creator";
import {
  Modal as NativeModal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

const Root = createModal({
  Root: ({
    isOpen,
    onClose,
    children,
    ...props
  }: React.ComponentProps<typeof NativeModal> & {
    isOpen?: boolean;
    onClose?: () => void;
  }) => (
    <NativeModal
      {...props}
      visible={isOpen}
      onRequestClose={onClose}
      transparent
      animationType="fade"
    >
      {children}
    </NativeModal>
  ),
  Content: (props: React.ComponentProps<typeof View>) => (
    <View {...props} style={[styles.content, props.style]} />
  ),
  CloseButton: Pressable,
  Header: (props: React.ComponentProps<typeof View>) => (
    <View {...props} style={[styles.header, props.style]} />
  ),
  Footer: (props: React.ComponentProps<typeof View>) => (
    <View {...props} style={[styles.footer, props.style]} />
  ),
  Body: (props: React.ComponentProps<typeof View>) => (
    <View {...props} style={[styles.body, props.style]} />
  ),
  Backdrop: ({ style, ...props }: React.ComponentProps<typeof Pressable>) => (
    <Pressable
      {...props}
      style={(state) => [
        styles.backdrop,
        typeof style === "function" ? style(state) : style,
      ]}
    />
  ),
});

export const Modal = Root;
export const ModalBackdrop = Root.Backdrop;
export const ModalContent = Root.Content;
export const ModalHeader = Root.Header;
export const ModalBody = Root.Body;
export const ModalFooter = Root.Footer;
export const ModalClose = Root.CloseButton;

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
