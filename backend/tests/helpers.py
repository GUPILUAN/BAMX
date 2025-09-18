from unittest.mock import patch


def patch_repo_method(cls, method_name, return_value):
    patcher = patch.object(cls, method_name, return_value=return_value)
    patcher.start()
    return patcher
