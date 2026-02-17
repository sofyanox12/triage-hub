import { db, DbExecutor } from '@/lib/db'
import { RegisterInput } from '@triage/shared'

class UserRepository {
    /**
     * Create a new user
     */
    static async create(data: RegisterInput, trx: DbExecutor = db) {
        return trx
            .insertInto('users')
            .values({
                name: data.name,
                email: data.email,
                password: data.password,
                type: data.type,
            })
            .returningAll()
            .executeTakeFirstOrThrow()
    }

    /**
     * Find user by email
     */
    static async findByEmail(email: string, trx: DbExecutor = db) {
        return trx
            .selectFrom('users')
            .selectAll()
            .where('email', '=', email)
            .executeTakeFirst()
    }

    /**
     * Find user by ID
     */
    static async findById(id: string, trx: DbExecutor = db) {
        return trx
            .selectFrom('users')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst()
    }
}

export { UserRepository }
