import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'

import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),

    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`starts retreiving todos for user with id: ${userId}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

    logger.info(`completes retreiving todos for user with id: ${userId}`)

    return result.Items as TodoItem[]
  }

  async createTodo(newTodoItem: TodoItem): Promise<TodoItem> {
    logger.info(
      `starts creating todos with todoDetails : ${JSON.stringify(newTodoItem)}`
    )

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: newTodoItem
      })
      .promise()

    logger.info(
      `completes creating todos with todoDetails : ${JSON.stringify(
        newTodoItem
      )}`
    )

    return newTodoItem as TodoItem
  }

  async updateTodo(updateDetails: any): Promise<void> {
    logger.info(
      `starts updating todos with todoDetails : ${JSON.stringify(
        updateDetails
      )}`
    )

    const updateExpression = 'set #name = :name, #dueDate=:dueDate, #done=:done'

    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: updateDetails.todoId,
        userId: updateDetails.userId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ':name': updateDetails.name,
        ':dueDate': updateDetails.dueDate,
        ':done': updateDetails.done
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      }
    }

    await this.docClient.update(params).promise()

    logger.info(
      `complets updating with todoDetails : ${JSON.stringify(updateDetails)}`
    )
  }

  async deleteTodo(todoId: string, userId: string): Promise<void> {
    logger.info(`starts deleting with userId :${userId} with todoId: ${todoId}`)

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      })
      .promise()
  }

  async assignImageUrl(todoId: string, userId: string, imageUrl: string) {
    const updateExpression = 'set #attachmentUrl = :attachmentUrl'

    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ':attachmentUrl': imageUrl
      },
      ExpressionAttributeNames: {
        '#attachmentUrl': 'attachmentUrl'
      },
      ReturnValues: 'UPDATED_NEW'
    }

    await this.docClient.update(params).promise()
  }
}
