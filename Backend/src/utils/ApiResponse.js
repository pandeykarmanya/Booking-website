class ApiResponse {
    constructor(
        statusCode, 
        message = "Request successful",
        data = "success",
    )
    {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;
        this.errors = [];
    }
}

export { ApiResponse };