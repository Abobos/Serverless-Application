import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { v4 as uuidv4 } from 'uuid'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils'

import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('start processing event', { event })

    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event)

    const newItem = {
      todoId: uuidv4(),
      userId,
      ...newTodo,
      done: false,
      createdAt: new Date().toISOString(),
      dueDate: new Date(newTodo.dueDate).toISOString()
    }

    await createTodo(newItem)

    logger.info('complete processing event', { event })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ item: newItem })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
