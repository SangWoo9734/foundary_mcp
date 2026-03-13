import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode
} from "react";

export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "sm" | "md" | "lg";
export type InputIconName = "search" | "eye";
export type IconSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export type CardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export type LayoutProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export type IconProps = {
  name: InputIconName;
  size?: IconSize;
  className?: string;
};

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  leadingIcon?: InputIconName;
  trailingIcon?: InputIconName;
  invalid?: boolean;
};

export type FormProps = HTMLAttributes<HTMLFormElement> & {
  children?: ReactNode;
};

export type FormFieldProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
  message?: string;
  children?: ReactNode;
};
