'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import {
    FormProvider,
    UseFormReturn,
    FieldValues,
    FieldErrors,
} from 'react-hook-form'

type FormWrapperProps<T extends FieldValues> = {
    form: UseFormReturn<T>
    onSubmit?: (data: T) => void
    onInvalid?: (
        errors: FieldErrors<T>,
        event?: React.BaseSyntheticEvent
    ) => void
    action?: string | ((formData: FormData) => void | Promise<void>)
    isLoading?: boolean
    children: ReactNode
    className?: string
}

/**
 * FormWrapper component provides a wrapper for forms using react-hook-form.
 * @param form - The form instance from react-hook-form.
 * @param onSubmit - Callback function to handle form submission.
 * @param onInvalid - Callback function to handle form validation errors.
 * @param isLoading - Boolean indicating if the form is in a loading state.
 */
const FormWrapper = <T extends FieldValues>({
    form,
    children,
    onSubmit,
    onInvalid,
    isLoading = false,
    action,
    className,
}: FormWrapperProps<T>) => {
    const onInvalidHandler = !onInvalid
        ? (errors: unknown) => {
              console.log('Form validation errors:', errors)
          }
        : onInvalid

    const onSubmitHandler = (data: T) => {
        if (isLoading || !onSubmit) return
        onSubmit(data)
    }

    return (
        <FormProvider {...form}>
            <form
                onSubmit={
                    onSubmit
                        ? form.handleSubmit(onSubmitHandler, onInvalidHandler)
                        : undefined
                }
                action={action}
                className={cn('w-full space-y-4', className)}
            >
                {children}
            </form>
        </FormProvider>
    )
}

FormWrapper.displayName = 'FormWrapper'

export { FormWrapper }
