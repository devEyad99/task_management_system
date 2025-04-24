//
export class DeleteTaskByIdResponseDto {
  message?: string;

  static fromTaskId(): DeleteTaskByIdResponseDto {
    const result = new DeleteTaskByIdResponseDto();

    result.message = 'Task deleted successfully';

    return result;
  }
}
