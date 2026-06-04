

export enum Success {
    OK = 200,
    Created = 201,
    No_content = 204,
}
export enum Client {
    bad_req = 400,
    unathorized = 401,
    Forbidden = 403,
    Not_found = 404,
    Conflict = 409
}

export enum Server {
    Internal_Server = 500,
    Service_Unavailable = 503
}