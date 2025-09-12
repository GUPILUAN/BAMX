class UserInfoDTO:
    def __init__(
        self,
        id: int,
        username: str,
        name: str,
        email: str | None,
        phone: str | None,
        state: str | None,
        position: str | None,
        department: str | None,
        profile_picture: str | None,
        status: str | None = None,
        role: str | None = None,
        company: str | None = None,
    ):
        self.id = id
        self.username = username
        self.name = name
        self.email = email
        self.phone = phone
        self.state = state
        self.position = position
        self.department = department
        self.role = role
        self.profile_picture = profile_picture
        self.status = status
        self.company = company

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "state": self.state,
            "position": self.position,
            "department": self.department,
            "role": self.role,
            "profile_picture": self.profile_picture,
            "status": self.status,
            "company": self.company,
        }
