from sqlalchemy.types import TypeDecorator, String


class BlobText(TypeDecorator):
    impl = String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return value.encode("utf-8")  # convertir string a bytes para guardar
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return value.read()
        return value
