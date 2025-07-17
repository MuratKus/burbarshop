'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"
import { Input } from "./input"
import { Button } from "./button"
import { AlertCircle, CheckCircle } from "lucide-react"

interface FormProps {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
}

export function Form({ children, onSubmit, className }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-6", className)}>
      {children}
    </form>
  )
}

interface FormFieldProps {
  children: React.ReactNode
  className?: string
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  required?: boolean
}

export function FormInput({ 
  label, 
  error, 
  success, 
  required, 
  className, 
  ...props 
}: FormInputProps) {
  const inputId = React.useId()
  
  return (
    <FormField>
      {label && (
        <Label htmlFor={inputId} className="flex items-center space-x-1">
          <span>{label}</span>
          {required && <span className="text-accent-coral">*</span>}
        </Label>
      )}
      <Input
        id={inputId}
        className={cn(
          error && "border-red-500 focus-visible:ring-red-500",
          success && "border-green-500 focus-visible:ring-green-500",
          className
        )}
        {...props}
      />
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}
    </FormField>
  )
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  required?: boolean
}

export function FormTextarea({ 
  label, 
  error, 
  success, 
  required, 
  className, 
  ...props 
}: FormTextareaProps) {
  const textareaId = React.useId()
  
  return (
    <FormField>
      {label && (
        <Label htmlFor={textareaId} className="flex items-center space-x-1">
          <span>{label}</span>
          {required && <span className="text-accent-coral">*</span>}
        </Label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "flex min-h-[120px] w-full rounded-lg border border-neutral-border-light bg-white px-3 py-2 text-sm font-body text-primary-charcoal placeholder:text-neutral-gray focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          error && "border-red-500 focus-visible:ring-red-500",
          success && "border-green-500 focus-visible:ring-green-500",
          className
        )}
        {...props}
      />
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}
    </FormField>
  )
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  success?: string
  required?: boolean
  options: Array<{ value: string; label: string }>
}

export function FormSelect({ 
  label, 
  error, 
  success, 
  required, 
  options, 
  className, 
  ...props 
}: FormSelectProps) {
  const selectId = React.useId()
  
  return (
    <FormField>
      {label && (
        <Label htmlFor={selectId} className="flex items-center space-x-1">
          <span>{label}</span>
          {required && <span className="text-accent-coral">*</span>}
        </Label>
      )}
      <select
        id={selectId}
        className={cn(
          "flex h-12 w-full rounded-lg border border-neutral-border-light bg-white px-3 py-2 text-sm font-body text-primary-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          success && "border-green-500 focus-visible:ring-green-500",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">{success}</span>
        </div>
      )}
    </FormField>
  )
}

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function FormCheckbox({ 
  label, 
  error, 
  className, 
  ...props 
}: FormCheckboxProps) {
  const checkboxId = React.useId()
  
  return (
    <FormField>
      <div className="flex items-center space-x-2">
        <input
          id={checkboxId}
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-neutral-border-light text-accent-coral focus:ring-accent-coral focus:ring-offset-0",
            error && "border-red-500",
            className
          )}
          {...props}
        />
        <Label htmlFor={checkboxId} className="text-sm font-body cursor-pointer">
          {label}
        </Label>
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </FormField>
  )
}

interface FormSubmitProps {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  className?: string
  variant?: "default" | "secondary" | "outline"
}

export function FormSubmit({ 
  children, 
  loading, 
  disabled, 
  className, 
  variant = "default",
  ...props 
}: FormSubmitProps) {
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={disabled || loading}
      className={cn("w-full", className)}
      {...props}
    >
      {loading ? "Processing..." : children}
    </Button>
  )
}