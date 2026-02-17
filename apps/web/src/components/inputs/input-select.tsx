'use client'

import { useFormContext } from 'react-hook-form'
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface SelectItemProps {
    value: string
    label: string
}

interface InputSelectProps {
    name: string
    label?: string
    placeholder?: string
    description?: string
    items: SelectItemProps[]
    className?: string
    disabled?: boolean
}

const InputSelect = ({
    name,
    label,
    placeholder = 'Select an option',
    description,
    items,
    className,
    disabled,
}: InputSelectProps) => {
    const { control } = useFormContext()

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('space-y-2', className)}>
                    {label && <FormLabel>{label}</FormLabel>}
                    {description && (
                        <FormDescription className="text-xs text-muted-foreground">
                            {description}
                        </FormDescription>
                    )}
                    <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={disabled}
                    >
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {items.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export { InputSelect }
