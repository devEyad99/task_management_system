"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskResponseDto = void 0;
class CreateTaskResponseDto {
    static factory(task, user) {
        const result = new CreateTaskResponseDto();
        result.task = {
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            deadline: task.deadline,
            assigned_to: task.assigned_to,
        };
        result.user = user;
        result.message = 'Task created';
        result.status = 'OK';
        return result;
    }
}
exports.CreateTaskResponseDto = CreateTaskResponseDto;
