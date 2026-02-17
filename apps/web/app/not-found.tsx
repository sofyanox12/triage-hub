import Link from 'next/link'

const NotFound = () => {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center space-y-4">
            <h2 className="text-2xl font-bold">Not Found</h2>
            <p className="text-muted-foreground">
                Could not find requested resource
            </p>
            <Link href="/" className="text-primary hover:underline">
                Return Home
            </Link>
        </div>
    )
}

export default NotFound
