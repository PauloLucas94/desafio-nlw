import type {FastifyPluginCallbackZod} from 'fastify-type-provider-zod';
import {z} from 'zod/v4';
import { schema } from '../../db/schema/index.ts';
import { db } from '../../db/connection.ts';

export const createRoomRoute:FastifyPluginCallbackZod =  (app)=> {
    app.post('/rooms',{
        schema:{
            body:z.object({
                name:z.string().min(1).max(100),
                description:z.string().max(500).optional(),

            }),
        }
    }, async (request, reply) =>{
        const{name, description} = request.body
        const result = await db
            .insert(schema.rooms)
            .values({
                name,
                description
                }).returning()

        const insertedRoom = result[0];

        if(!insertedRoom) {
            throw new Error('Failed to create a new room.')
        }
        
        return reply.status(201).send({roomId: insertedRoom.id})
    })
}