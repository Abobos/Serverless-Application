import { TodoAccess } from './todoAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { AttachmentUtils } from './attachmentUtils'
import { TodoUpdate } from '../models/TodoUpdate'

const todoAccess = new TodoAccess()
const attachmentUtils = new AttachmentUtils()

export const getTodos = async (userId: string): Promise<TodoItem[]> => {
  return todoAccess.getTodos(userId)
}

export const createTodo = async (
  todo: CreateTodoRequest
): Promise<TodoItem> => {
  return todoAccess.createTodo(todo as TodoItem)
}

export const updateTodo = async (
  todoId: string,
  todoDetails: UpdateTodoRequest,
  userId: string
): Promise<void> => {
  const updateDetails = {
    todoId,
    userId,
    name: todoDetails.name,
    dueDate: todoDetails.dueDate,
    done: todoDetails.done,
    createdAt: new Date().toISOString()
  } as TodoUpdate

  await todoAccess.updateTodo(updateDetails)
}

export const deleteTodo = async (todoId: string, userId: string) => {
  await todoAccess.deleteTodo(todoId, userId)
}

export const createAttachmentPresignedUrl = async (
  todoId: string,
  userId: string
) => {
  const presignedUrl = attachmentUtils.getSignedUrl(todoId)

  const imageUrl = attachmentUtils.getUrl(todoId)

  await todoAccess.assignImageUrl(todoId, userId, imageUrl)

  return presignedUrl
}
