class ApiResponse:
    def __init__(self, success: bool, message: str, data: dict | None = None):
        self.success = success
        self.message = message
        self.data = data

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "message": self.message,
            "data": self.data,
        }
