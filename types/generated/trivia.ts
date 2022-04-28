export type Trivia = {
  "version": "0.1.0",
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
          "name": "prizeFundMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "prizeFundVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeFundDeposit",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeFundVaultAuthority",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
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
        },
        {
          "name": "prizeFundVaultBump",
          "type": "u8"
        },
        {
          "name": "prizeFundVaultAuthorityBump",
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
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "feePayer",
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
          "name": "userBump",
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
    },
    {
      "name": "startWinClaiming",
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
      "name": "finishWinClaiming",
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
      "name": "claimWin",
      "accounts": [
        {
          "name": "trivia",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
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
      "args": []
    },
    {
      "name": "claimPrize",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeFundVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeFundVaultAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "targetAccount",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
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
          },
          {
            "name": "claimedWin",
            "type": "bool"
          },
          {
            "name": "claimedPrize",
            "type": "bool"
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
          },
          {
            "name": "correctAnswers",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "winners",
            "type": "u32"
          },
          {
            "name": "winClaimingStatus",
            "type": {
              "defined": "WinClaimingStatus"
            }
          },
          {
            "name": "prizeFundVault",
            "type": "publicKey"
          },
          {
            "name": "prizeFundAmount",
            "type": "u64"
          },
          {
            "name": "prizeFundVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "prizeFundVaultAuthorityBump",
            "type": "u8"
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
          },
          {
            "name": "prizeFundAmount",
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
            "name": "answerVariantId",
            "type": {
              "option": "u32"
            }
          }
        ]
      }
    },
    {
      "name": "WinClaimingStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "NotStarted"
          },
          {
            "name": "Active"
          },
          {
            "name": "Finished"
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
    },
    {
      "name": "WinClaimingStartedEvent",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorized",
      "msg": "You do not have sufficient permissions to perform this action."
    },
    {
      "code": 6001,
      "name": "PlayerAlreadyWhitelisted",
      "msg": "User already whitelisted."
    },
    {
      "code": 6002,
      "name": "PlayerNotWhitelisted",
      "msg": "User not whitelisted."
    },
    {
      "code": 6003,
      "name": "NotEnoughInvitesLeft",
      "msg": "Not enough invites left."
    },
    {
      "code": 6004,
      "name": "InvalidGameName",
      "msg": "Invalid game name."
    },
    {
      "code": 6005,
      "name": "InvalidGameStartTime",
      "msg": "Game start time must be in the future."
    },
    {
      "code": 6006,
      "name": "InvalidPrizeFundAmount",
      "msg": "Game should have a prize fund."
    },
    {
      "code": 6007,
      "name": "GameAlreadyStarted",
      "msg": "Game already started."
    },
    {
      "code": 6008,
      "name": "GameNotStarted",
      "msg": "Game not started."
    },
    {
      "code": 6009,
      "name": "RevealedQuestionsOnGameCreation",
      "msg": "No questions should be revealed on game creation."
    },
    {
      "code": 6010,
      "name": "GameDoesNotExist",
      "msg": "Game does not exist."
    },
    {
      "code": 6011,
      "name": "QuestionRevealedAhead",
      "msg": "Question can't be revealed ahead."
    },
    {
      "code": 6012,
      "name": "QuestionDoesNotExist",
      "msg": "Question does not exist."
    },
    {
      "code": 6013,
      "name": "PreviousQuestionWasNotAnswered",
      "msg": "Previous question wasn't answered"
    },
    {
      "code": 6014,
      "name": "InvalidQuestionHash",
      "msg": "Invalid question hash."
    },
    {
      "code": 6015,
      "name": "InvalidQuestionVariantHash",
      "msg": "Invalid question variant hash."
    },
    {
      "code": 6016,
      "name": "QuestionIsNotRevealed",
      "msg": "Question is not revealed."
    },
    {
      "code": 6017,
      "name": "QuestionDeadlineExceeded",
      "msg": "Question deadline exceeded."
    },
    {
      "code": 6018,
      "name": "VariantDoesNotExist",
      "msg": "Variant does not exist."
    },
    {
      "code": 6019,
      "name": "AnswerAlreadyRevealed",
      "msg": "Answer already revealed."
    },
    {
      "code": 6020,
      "name": "QuestionDeadlineNotExceeded",
      "msg": "Question deadline not exceeded."
    },
    {
      "code": 6021,
      "name": "QuestionsLimitReached",
      "msg": "Questions limit reached."
    },
    {
      "code": 6022,
      "name": "WinClaimingAlreadyStarted",
      "msg": "Win claiming already started."
    },
    {
      "code": 6023,
      "name": "WinClaimingNotActive",
      "msg": "Win claiming should be active."
    },
    {
      "code": 6024,
      "name": "WinClaimingNotFinished",
      "msg": "Win claiming should finished for prize distribution."
    },
    {
      "code": 6025,
      "name": "WinAlreadyClaimed",
      "msg": "Win already claimed for this user."
    },
    {
      "code": 6026,
      "name": "AnswerCountMismatch",
      "msg": "Answer count do not match."
    },
    {
      "code": 6027,
      "name": "WrongAnswer",
      "msg": "Wrong answer."
    },
    {
      "code": 6028,
      "name": "NoWinClaimed",
      "msg": "Player should claim win to receive prize."
    },
    {
      "code": 6029,
      "name": "PrizeAlreadyClaimed",
      "msg": "Player's prize already claimed."
    }
  ]
};

export const IDL: Trivia = {
  "version": "0.1.0",
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
          "name": "prizeFundMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "prizeFundVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeFundDeposit",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeFundVaultAuthority",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
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
        },
        {
          "name": "prizeFundVaultBump",
          "type": "u8"
        },
        {
          "name": "prizeFundVaultAuthorityBump",
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
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "feePayer",
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
          "name": "userBump",
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
    },
    {
      "name": "startWinClaiming",
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
      "name": "finishWinClaiming",
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
      "name": "claimWin",
      "accounts": [
        {
          "name": "trivia",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
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
      "args": []
    },
    {
      "name": "claimPrize",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeFundVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "prizeFundVaultAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "targetAccount",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
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
          },
          {
            "name": "claimedWin",
            "type": "bool"
          },
          {
            "name": "claimedPrize",
            "type": "bool"
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
          },
          {
            "name": "correctAnswers",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "winners",
            "type": "u32"
          },
          {
            "name": "winClaimingStatus",
            "type": {
              "defined": "WinClaimingStatus"
            }
          },
          {
            "name": "prizeFundVault",
            "type": "publicKey"
          },
          {
            "name": "prizeFundAmount",
            "type": "u64"
          },
          {
            "name": "prizeFundVaultAuthority",
            "type": "publicKey"
          },
          {
            "name": "prizeFundVaultAuthorityBump",
            "type": "u8"
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
          },
          {
            "name": "prizeFundAmount",
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
            "name": "answerVariantId",
            "type": {
              "option": "u32"
            }
          }
        ]
      }
    },
    {
      "name": "WinClaimingStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "NotStarted"
          },
          {
            "name": "Active"
          },
          {
            "name": "Finished"
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
    },
    {
      "name": "WinClaimingStartedEvent",
      "fields": [
        {
          "name": "game",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorized",
      "msg": "You do not have sufficient permissions to perform this action."
    },
    {
      "code": 6001,
      "name": "PlayerAlreadyWhitelisted",
      "msg": "User already whitelisted."
    },
    {
      "code": 6002,
      "name": "PlayerNotWhitelisted",
      "msg": "User not whitelisted."
    },
    {
      "code": 6003,
      "name": "NotEnoughInvitesLeft",
      "msg": "Not enough invites left."
    },
    {
      "code": 6004,
      "name": "InvalidGameName",
      "msg": "Invalid game name."
    },
    {
      "code": 6005,
      "name": "InvalidGameStartTime",
      "msg": "Game start time must be in the future."
    },
    {
      "code": 6006,
      "name": "InvalidPrizeFundAmount",
      "msg": "Game should have a prize fund."
    },
    {
      "code": 6007,
      "name": "GameAlreadyStarted",
      "msg": "Game already started."
    },
    {
      "code": 6008,
      "name": "GameNotStarted",
      "msg": "Game not started."
    },
    {
      "code": 6009,
      "name": "RevealedQuestionsOnGameCreation",
      "msg": "No questions should be revealed on game creation."
    },
    {
      "code": 6010,
      "name": "GameDoesNotExist",
      "msg": "Game does not exist."
    },
    {
      "code": 6011,
      "name": "QuestionRevealedAhead",
      "msg": "Question can't be revealed ahead."
    },
    {
      "code": 6012,
      "name": "QuestionDoesNotExist",
      "msg": "Question does not exist."
    },
    {
      "code": 6013,
      "name": "PreviousQuestionWasNotAnswered",
      "msg": "Previous question wasn't answered"
    },
    {
      "code": 6014,
      "name": "InvalidQuestionHash",
      "msg": "Invalid question hash."
    },
    {
      "code": 6015,
      "name": "InvalidQuestionVariantHash",
      "msg": "Invalid question variant hash."
    },
    {
      "code": 6016,
      "name": "QuestionIsNotRevealed",
      "msg": "Question is not revealed."
    },
    {
      "code": 6017,
      "name": "QuestionDeadlineExceeded",
      "msg": "Question deadline exceeded."
    },
    {
      "code": 6018,
      "name": "VariantDoesNotExist",
      "msg": "Variant does not exist."
    },
    {
      "code": 6019,
      "name": "AnswerAlreadyRevealed",
      "msg": "Answer already revealed."
    },
    {
      "code": 6020,
      "name": "QuestionDeadlineNotExceeded",
      "msg": "Question deadline not exceeded."
    },
    {
      "code": 6021,
      "name": "QuestionsLimitReached",
      "msg": "Questions limit reached."
    },
    {
      "code": 6022,
      "name": "WinClaimingAlreadyStarted",
      "msg": "Win claiming already started."
    },
    {
      "code": 6023,
      "name": "WinClaimingNotActive",
      "msg": "Win claiming should be active."
    },
    {
      "code": 6024,
      "name": "WinClaimingNotFinished",
      "msg": "Win claiming should finished for prize distribution."
    },
    {
      "code": 6025,
      "name": "WinAlreadyClaimed",
      "msg": "Win already claimed for this user."
    },
    {
      "code": 6026,
      "name": "AnswerCountMismatch",
      "msg": "Answer count do not match."
    },
    {
      "code": 6027,
      "name": "WrongAnswer",
      "msg": "Wrong answer."
    },
    {
      "code": 6028,
      "name": "NoWinClaimed",
      "msg": "Player should claim win to receive prize."
    },
    {
      "code": 6029,
      "name": "PrizeAlreadyClaimed",
      "msg": "Player's prize already claimed."
    }
  ]
};
