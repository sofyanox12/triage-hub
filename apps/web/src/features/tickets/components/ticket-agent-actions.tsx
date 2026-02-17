import { InputSelect, InputTextarea } from '@/components/inputs'
import { Badge, Button, Label } from '@/components/ui'
import { Brain, CheckCircle, Loader2, Save, XCircle } from 'lucide-react'
import { Ticket } from '../api/ticket.types'

interface TicketAgentActionsProps {
    ticket: Ticket
    isProcessing: boolean
    isDisabled: boolean
    isFinalized: boolean
    isCompleted: boolean
    handleSave: () => Promise<void>
    handleResolve: () => Promise<void>
    handleCancel: () => Promise<void>
    isSavePending: boolean
    isResolvePending: boolean
    isCancelPending: boolean
}

const TicketAgentActions = ({
    ticket,
    isProcessing,
    isDisabled,
    isFinalized,
    isCompleted,
    handleSave,
    handleResolve,
    handleCancel,
    isSavePending,
    isResolvePending,
    isCancelPending,
}: TicketAgentActionsProps) => {
    return (
        <>
            <InputTextarea
                name="resolutionResponse"
                label={
                    <div className="flex items-center gap-2">
                        Resolution Response
                        {isProcessing && (
                            <Badge
                                variant="outline"
                                className="text-xs font-normal"
                            >
                                <Brain className="mr-1 h-3 w-3" />
                                AI processing...
                            </Badge>
                        )}
                    </div>
                }
                containerClassName="grid gap-3 space-y-0"
                className="min-h-[120px]"
                placeholder="Resolution response to the customer for this ticket..."
                disabled={isDisabled}
            />

            <div className="grid grid-cols-2 gap-4">
                <InputSelect
                    name="urgency"
                    label="Urgency"
                    items={[
                        { value: 'LOW', label: 'Low' },
                        { value: 'MEDIUM', label: 'Medium' },
                        { value: 'HIGH', label: 'High' },
                    ]}
                    disabled={isDisabled}
                />
                <div className="space-y-2">
                    <Label>Sentiment Score (AI)</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
                        {ticket.sentiment ?? '-'} / 10
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t">
                <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={
                        isFinalized ||
                        ticket.status === 'PROCESSING' ||
                        isCancelPending
                    }
                >
                    {isCancelPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Cancel Ticket
                </Button>

                <div className="flex items-center gap-2 ml-auto">
                    <Button
                        variant="secondary"
                        onClick={handleSave}
                        disabled={isDisabled || isSavePending}
                    >
                        {isSavePending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Changes
                    </Button>

                    <Button
                        onClick={handleResolve}
                        disabled={!isCompleted || isResolvePending}
                    >
                        {isResolvePending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Resolve
                    </Button>
                </div>
            </div>
        </>
    )
}

export { TicketAgentActions }
