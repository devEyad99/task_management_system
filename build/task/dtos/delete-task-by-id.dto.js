"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTaskByIdResponseDto = void 0;
//
class DeleteTaskByIdResponseDto {
    static fromTaskId() {
        const result = new DeleteTaskByIdResponseDto();
        result.message = 'Task deleted successfully';
        return result;
    }
}
exports.DeleteTaskByIdResponseDto = DeleteTaskByIdResponseDto;
