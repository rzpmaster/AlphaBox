from typing import Annotated

from pydantic import EmailStr, Field

EmailAddress = Annotated[EmailStr, Field(max_length=255)]
