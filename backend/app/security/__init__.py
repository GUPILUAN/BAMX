# Aspel mapping (hex code)
ASPEL_MAP = {
    "0": "\u201d",  # 201d
    "1": "\u2022",  # 2022
    "2": "\u2013",  # 2013
    "3": "\u2014",  # 2014
    "4": "\u02dc",  # 2dc
    "5": "\u2122",  # 2122
    "6": "\u0161",  # 0161
    "7": "\u203a",  # 203a
    "8": "\u0153",  # 0153
    "9": "\ufffd",  # fffd
    "_": "\xc3",  # c3
    "a": "\xa5",  # a5
    "b": "\xa6",  # a6
    "c": "\xa7",  # a7
    "d": "\xa8",  # a8
    "e": "\xa9",  # a9
    "f": "\xaa",  # aa
    "g": "\xab",  # ab
    "h": "\xac",  # ac
    "i": "\xad",  # ad
    "j": "\xae",  # ae
    "k": "\xaf",  # af
    "l": "\xb0",  # b0
    "m": "\xb1",  # b1
    "n": "\xb2",  # b2
    "o": "\xb3",  # b3
    "p": "\xb4",  # b4
    "q": "\xb5",  # b5
    "r": "\xb6",  # b6
    "s": "\xb7",  # b7
    "t": "\xb8",  # b8
    "u": "\xb9",  # b9
    "v": "\xba",  # ba
    "w": "\xbb",  # bb
    "x": "\xbc",  # bc
    "y": "\xbd",  # bd
    "z": "\xbe",  # be
}


def hash_aspel(password: str) -> str:
    """Simulates Aspel password encoding.

    Args:
        password (str): The password to encode.

    Returns:
        str: The encoded password.
    """
    password = password.lower()  # Does not distinguish between upper and lower case
    result = "".join(ASPEL_MAP.get(c, "?") for c in password)
    return result
