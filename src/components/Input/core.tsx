import Typography from "@components/Typography";
import { cx } from "class-variance-authority";
import type { ComponentChildren, FunctionComponent } from "preact";
import type { HTMLAttributes } from "preact/compat";
import { useEffect, useId, useImperativeHandle, useRef } from "preact/hooks";
import './input.css';
import type {
  FieldError,
  RegisterOptions,
  UseControllerProps,
} from "react-hook-form";

export type BaseInputProps = Omit<
  HTMLAttributes<HTMLInputElement>,
  | "name"
  | "class"
  | "pattern"
  | "required"
  | "minLength"
  | "maxLength"
  | "disabled"
> & {
  leftAdornment?: ComponentChildren | ComponentChildren[];
  rightAdornment?: ComponentChildren | ComponentChildren[];
  label?: string;
  rules?: UseControllerProps["rules"];
  validator?: (value: string) => string | true;
  name?: string;
};

type InputCoreProps = BaseInputProps &
  Omit<RegisterOptions, "validate" | "maxLength" | "minLength"> & {
    error?: FieldError;
  };

const InputCore: FunctionComponent<InputCoreProps> = ({
  label,
  rules,
  leftAdornment,
  rightAdornment,
  className,
  disabled,
  placeholder,
  error,
  ...props
}) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current?.value) {
      // we need to get the input's value on initial page load since browsers can autofill the form before the javascript gets executed
      props.onChange?.({ target: { value: inputRef.current.value } })
    }
  }, [])

  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-6 text-gray-900 flex gap-1"
        >
          {label}
          {rules?.required ? <Typography variant="error">*</Typography> : ""}
        </label>
      ) : null}
      <div className="flex rounded-md ">
        {leftAdornment ? (
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-3 text-gray-500 sm:text-sm">
            {leftAdornment}
          </span>
        ) : null}
        <input
          id={id}
          disabled={disabled}
          ref={inputRef}
          className={cx(
            `block w-full rounded-md border-0 p-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600  sm:text-sm sm:leading-6 focus-visible:outline-none`,
            leftAdornment ? "rounded-l-none" : "rounded-l-md",
            rightAdornment ? "rounded-r-none" : "rounded-r-md",
            error && "!ring-danger-600 focus:!ring-danger-600",
            className
          )}
          placeholder={placeholder || label || ""}
          {...props}
          pattern={undefined}
          required={false}
          readOnly={props.readOnly}
        />
        {rightAdornment || null}
      </div>
      <Typography size="body1/normal" className="text-danger-600 mt-0.5">
        {error ? error.message : ""}
      </Typography>
    </div>
  );
};

export default InputCore;
