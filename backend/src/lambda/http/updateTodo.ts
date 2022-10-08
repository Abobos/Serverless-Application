import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('starts processing event', { event })

    const todoId = event.pathParameters.todoId

    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event)

    logger.info(
      `about to process with todoId: ${todoId}, userId: ${userId} with ${JSON.stringify(
        updatedTodo
      )}`
    )

    await updateTodo(todoId, updatedTodo, userId)

    logger.info('completes processing event', { event })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
