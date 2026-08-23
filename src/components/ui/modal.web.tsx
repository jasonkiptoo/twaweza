import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

type ViewProps = React.ComponentProps<typeof View>;

type ModalProps = ViewProps & {
  isOpen?: boolean;
  onClose?: () => void;
};

function Root({ isOpen, children, ...props }: ModalProps) {
  if (!isOpen) return null;

  return (
    <View {...props} style={[styles.root, props.style]}>
      {children}
    </View>
  );
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

function Content(props: ViewProps) {
  return <View {...props} style={[styles.content, props.style]} />;
}

function Header(props: ViewProps) {
  return <View {...props} style={[styles.header, props.style]} />;
}

function Body(props: ViewProps) {
  return <View {...props} style={[styles.body, props.style]} />;
}

function Footer(props: ViewProps) {
  return <View {...props} style={[styles.footer, props.style]} />;
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
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(7, 17, 31, 0.55)",
  },
  content: {
    alignSelf: "center",
    maxHeight: "85%",
    width: "92%",
    maxWidth: 512,
    overflow: "hidden",
  },
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