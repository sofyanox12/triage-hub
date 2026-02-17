'use client'

import { ReactNode } from 'react'
import {
    ControllerFieldState,
    ControllerRenderProps,
    FieldValues,
    Path,
    UseFormReturn,
} from 'react-hook-form'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

type FieldWrapperProps<T extends FieldValues> = {
    form: UseFormReturn<T>
    name: Path<T>
    label?: string
    description?: string
    isRequired?: boolean
    className?: string
    children: (props: {
        field: ControllerRenderProps<T, Path<T>>
        fieldState: ControllerFieldState
    }) => ReactNode
}

/**
 * FieldWrapper provides a unified wrapper for form fields with consistent styling.
 * @param form - The form instance from react-hook-form.
 * @param name - The name of the field in the form.
 * @param label - Optional label for the field.
 * @param description - Optional description text below the label.
 * @param isRequired - Whether the field is required (shows asterisk).
 * @param className - Additional class names for FormItem.
 * @param children - Render function receiving field and fieldState.
 */
const FieldWrapper = <T extends FieldValues>({
    form,
    name,
    label,
    description,
    isRequired,
    className,
    children,
}: FieldWrapperProps<T>) => {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field, fieldState }) => (
                <FormItem className={cn(className)}>
                    {label && (
                        <FormLabel className="gap-1" htmlFor={field.name}>
                            {label}
                            {isRequired && (
                                <span className="text-destructive">*</span>
                            )}
                        </FormLabel>
                    )}
                    {description && (
                        <p className="mb-1 text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                    <FormControl>{children({ field, fieldState })}</FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

FieldWrapper.displayName = 'FieldWrapper'

export { FieldWrapper, type FieldWrapperProps }
