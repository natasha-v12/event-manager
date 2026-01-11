"use client";

import React from "react";
import { Controller, Control, FieldValues, ControllerRenderProps } from "react-hook-form";

type FormProps = React.FormHTMLAttributes<HTMLFormElement> & { form?: any };

export function Form({ form, children, ...props }: FormProps) {
  return (
    // allow react-hook-form submission handling via form.handleSubmit in parent
    <form {...props}>{children}</form>
  );
}

type FormFieldRender<TFieldValues extends FieldValues> = (args: {
  field: ControllerRenderProps<TFieldValues, any>;
  fieldState: any;
}) => React.ReactNode;

type FormFieldProps<TFieldValues extends FieldValues> = {
  name: any;
  form: { control: Control<TFieldValues> } & any;
  render: FormFieldRender<TFieldValues>;
};

export function FormField<TFieldValues extends FieldValues>({ name, form, render }: FormFieldProps<TFieldValues>) {
  return (
    <Controller<TFieldValues, any>
      name={name}
      control={form.control}
      render={({ field, fieldState }) => <>{render({ field, fieldState })}</>}
    />
  );
}

export const FormItem = ({ children }: { children?: React.ReactNode }) => <div className="mb-3">{children}</div>;
export const FormLabel = ({ children }: { children?: React.ReactNode }) => <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>;
export const FormControl = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export const FormMessage = ({ children }: { children?: React.ReactNode }) => (
  <p className="text-xs text-red-600 mt-1">{children}</p>
);

export default Form;
