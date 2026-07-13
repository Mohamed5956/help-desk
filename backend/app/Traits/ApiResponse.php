<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    protected function success(
        JsonResource|ResourceCollection|array|null $data = null,
        string $message = 'Success',
        int $status = 200
    ): JsonResponse {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function created(
        JsonResource|array|null $data = null,
        string $message = 'Created'
    ): JsonResponse {
        return $this->success($data, $message, 201);
    }

    protected function error(
        string $message = 'Something went wrong',
        int $status = 400,
        array $errors = []
    ): JsonResponse {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}
