export type Trivia = {
  "version": "0.0.0",
  "name": "trivia",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "trivia",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "whitelistUser",
      "accounts": [
        {
          "name": "trivia",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "whitelistedUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userKey",
          "type": "publicKey"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "addUserInvite",
      "accounts": [
        {
          "name": "trivia",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "inviteUser",
      "accounts": [
        {
          "name": "trivia",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "invitedUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userKey",
          "type": "publicKey"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createGame",
      "accounts": [
        {
          "name": "trivia",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "options",
          "type": {
            "defined": "GameOptions"
          }
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "editGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "options",
          "type": {
            "defined": "GameOptions"
          }
        }
      ]
    },
    {
      "name": "startGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "addQuestion",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "variants",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "time",
          "type": "u64"
        }
      ]
    },
    {
      "name": "removeQuestion",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "questionKey",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "moveQuestion",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "questionKey",
          "type": "publicKey"
        },
        {
          "name": "newPosition",
          "type": "u32"
        }
      ]
    },
    {
      "name": "revealQuestion",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "revealedName",
          "type": "string"
        },
        {
          "name": "revealedVariants",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "submitAnswer",
      "accounts": [
        {
          "name": "trivia",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "variantId",
          "type": "u32"
        },
        {
          "name": "playerBump",
          "type": "u8"
        },
        {
          "name": "answerBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "revealAnswer",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "revealedVariantId",
          "type": "u32"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "trivia",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "gamesCounter",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "trivia",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "finishedGamesCounter",
            "type": "u32"
          },
          {
            "name": "leftInvitesCounter",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "game",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "answers",
            "type": {
              "vec": "u32"
            }
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "trivia",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "questionKeys",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "revealedQuestionsCounter",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "question",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "game",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "question",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "variants",
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "time",
            "type": "u64"
          },
          {
            "name": "revealedQuestion",
            "type": {
              "option": {
                "defined": "RevealedQuestion"
              }
            }
          }
        ]
      }
    },
    {
      "name": "answer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "question",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "variantId",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameOptions",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "startTime",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "RevealedQuestion",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "variants",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "deadline",
            "type": "u64"
          },
          {
            "name": "answerKeys",
            "type": {
              "vec": {
                "vec": "publicKey"
              }
            }
          },
          {
            "name": "answerVariantId",
            "type": {
              "option": "u32"
            }
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "EditGameEvent",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RevealQuestionEvent",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "question",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RevealAnswerEvent",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "question",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 300,
      "name": "Unauthorized",
      "msg": "You do not have sufficient permissions to perform this action."
    },
    {
      "code": 301,
      "name": "PlayerAlreadyWhitelisted",
      "msg": "User already whitelisted."
    },
    {
      "code": 302,
      "name": "PlayerNotWhitelisted",
      "msg": "User not whitelisted."
    },
    {
      "code": 303,
      "name": "NotEnoughInvitesLeft",
      "msg": "Not enough invites left."
    },
    {
      "code": 304,
      "name": "InvalidGameName",
      "msg": "Invalid game name."
    },
    {
      "code": 305,
      "name": "InvalidGameStartTime",
      "msg": "Game start time must be in the future."
    },
    {
      "code": 306,
      "name": "GameAlreadyStarted",
      "msg": "Game already started."
    },
    {
      "code": 307,
      "name": "GameNotStarted",
      "msg": "Game not started."
    },
    {
      "code": 308,
      "name": "RevealedQuestionsOnGameCreation",
      "msg": "No questions should be revealed on game creation."
    },
    {
      "code": 309,
      "name": "GameDoesNotExist",
      "msg": "Game does not exist."
    },
    {
      "code": 310,
      "name": "QuestionRevealedAhead",
      "msg": "Question can't be revealed ahead."
    },
    {
      "code": 311,
      "name": "QuestionDoesNotExist",
      "msg": "Question does not exist."
    },
    {
      "code": 312,
      "name": "PreviousQuestionWasNotAnswered",
      "msg": "Previous question wasn't answered"
    },
    {
      "code": 313,
      "name": "InvalidQuestionHash",
      "msg": "Invalid question hash."
    },
    {
      "code": 314,
      "name": "InvalidQuestionVariantHash",
      "msg": "Invalid question variant hash."
    },
    {
      "code": 315,
      "name": "QuestionIsNotRevealed",
      "msg": "Question is not revealed."
    },
    {
      "code": 316,
      "name": "QuestionDeadlineExceeded",
      "msg": "Question deadline exceeded."
    },
    {
      "code": 317,
      "name": "VariantDoesNotExist",
      "msg": "Variant does not exist."
    },
    {
      "code": 318,
      "name": "QuestionDeadlineNotExceeded",
      "msg": "Question deadline not exceeded."
    }
  ]
};

export const IDL: Trivia = {
  "version": "0.0.0",
  "name": "trivia",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "trivia",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "whitelistUser",
      "accounts": [
        {
          "name": "trivia",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "whitelistedUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userKey",
          "type": "publicKey"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "addUserInvite",
      "accounts": [
        {
          "name": "trivia",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "inviteUser",
      "accounts": [
        {
          "name": "trivia",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "invitedUser",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "userKey",
          "type": "publicKey"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createGame",
      "accounts": [
        {
          "name": "trivia",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "options",
          "type": {
            "defined": "GameOptions"
          }
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "editGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "options",
          "type": {
            "defined": "GameOptions"
          }
        }
      ]
    },
    {
      "name": "startGame",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "addQuestion",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "variants",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "time",
          "type": "u64"
        }
      ]
    },
    {
      "name": "removeQuestion",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "questionKey",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "moveQuestion",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "questionKey",
          "type": "publicKey"
        },
        {
          "name": "newPosition",
          "type": "u32"
        }
      ]
    },
    {
      "name": "revealQuestion",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "revealedName",
          "type": "string"
        },
        {
          "name": "revealedVariants",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "submitAnswer",
      "accounts": [
        {
          "name": "trivia",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "answer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "variantId",
          "type": "u32"
        },
        {
          "name": "playerBump",
          "type": "u8"
        },
        {
          "name": "answerBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "revealAnswer",
      "accounts": [
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "question",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "revealedVariantId",
          "type": "u32"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "trivia",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "gamesCounter",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "trivia",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "finishedGamesCounter",
            "type": "u32"
          },
          {
            "name": "leftInvitesCounter",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "game",
            "type": "publicKey"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "answers",
            "type": {
              "vec": "u32"
            }
          }
        ]
      }
    },
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "trivia",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "questionKeys",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "revealedQuestionsCounter",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "question",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "game",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "question",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "variants",
            "type": {
              "vec": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "time",
            "type": "u64"
          },
          {
            "name": "revealedQuestion",
            "type": {
              "option": {
                "defined": "RevealedQuestion"
              }
            }
          }
        ]
      }
    },
    {
      "name": "answer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "question",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "variantId",
            "type": "u32"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameOptions",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "startTime",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "RevealedQuestion",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "variants",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "deadline",
            "type": "u64"
          },
          {
            "name": "answerKeys",
            "type": {
              "vec": {
                "vec": "publicKey"
              }
            }
          },
          {
            "name": "answerVariantId",
            "type": {
              "option": "u32"
            }
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "EditGameEvent",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RevealQuestionEvent",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "question",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "RevealAnswerEvent",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "question",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 300,
      "name": "Unauthorized",
      "msg": "You do not have sufficient permissions to perform this action."
    },
    {
      "code": 301,
      "name": "PlayerAlreadyWhitelisted",
      "msg": "User already whitelisted."
    },
    {
      "code": 302,
      "name": "PlayerNotWhitelisted",
      "msg": "User not whitelisted."
    },
    {
      "code": 303,
      "name": "NotEnoughInvitesLeft",
      "msg": "Not enough invites left."
    },
    {
      "code": 304,
      "name": "InvalidGameName",
      "msg": "Invalid game name."
    },
    {
      "code": 305,
      "name": "InvalidGameStartTime",
      "msg": "Game start time must be in the future."
    },
    {
      "code": 306,
      "name": "GameAlreadyStarted",
      "msg": "Game already started."
    },
    {
      "code": 307,
      "name": "GameNotStarted",
      "msg": "Game not started."
    },
    {
      "code": 308,
      "name": "RevealedQuestionsOnGameCreation",
      "msg": "No questions should be revealed on game creation."
    },
    {
      "code": 309,
      "name": "GameDoesNotExist",
      "msg": "Game does not exist."
    },
    {
      "code": 310,
      "name": "QuestionRevealedAhead",
      "msg": "Question can't be revealed ahead."
    },
    {
      "code": 311,
      "name": "QuestionDoesNotExist",
      "msg": "Question does not exist."
    },
    {
      "code": 312,
      "name": "PreviousQuestionWasNotAnswered",
      "msg": "Previous question wasn't answered"
    },
    {
      "code": 313,
      "name": "InvalidQuestionHash",
      "msg": "Invalid question hash."
    },
    {
      "code": 314,
      "name": "InvalidQuestionVariantHash",
      "msg": "Invalid question variant hash."
    },
    {
      "code": 315,
      "name": "QuestionIsNotRevealed",
      "msg": "Question is not revealed."
    },
    {
      "code": 316,
      "name": "QuestionDeadlineExceeded",
      "msg": "Question deadline exceeded."
    },
    {
      "code": 317,
      "name": "VariantDoesNotExist",
      "msg": "Variant does not exist."
    },
    {
      "code": 318,
      "name": "QuestionDeadlineNotExceeded",
      "msg": "Question deadline not exceeded."
    }
  ]
};
