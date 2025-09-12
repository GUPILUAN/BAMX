from base64 import b64encode

from fdb import BlobReader

from ..dto.user_info import UserInfoDTO
from ..models import Usuario


def safe_b64encode(blob: bytes | BlobReader | None | str):
    """Convierte un BLOB de Firebird a base64, seguro para None y BlobReader"""
    if not blob:
        return None
    if isinstance(blob, BlobReader):
        blob = blob.read()
    return b64encode(blob).decode("utf-8") if isinstance(blob, bytes) else blob


def usuario_to_dto(user: Usuario) -> UserInfoDTO:
    # Foto en base64 (si existe)
    profile_picture = safe_b64encode(user.foto.FOTOGRAFIA) if user.foto else None

    # Empresa y rol (si existen relaciones)
    empresa = user.empresas[0].EMPRESA if user.empresas else None  # type: ignore
    rol = (
        user.empresas[0].rol.NOMBRE if user.empresas and user.empresas[0].rol else None  # type: ignore
    )
    status = user.empresas[0].STATUS if user.empresas else None  # type: ignore
    return UserInfoDTO(
        id=user.IDUSR,
        username=user.USUARIO,
        name=user.NOMBRE,
        email=user.MAIL,
        phone=None,  # No tienes campo teléfono aún en el modelo
        state=str(user.ESTADO) if user.ESTADO is not None else None,
        position=user.PUESTO,
        department=user.DEPTO,
        profile_picture=profile_picture if isinstance(profile_picture, str) else None,
        status=status,
        role=rol,
        company=empresa,
    )
