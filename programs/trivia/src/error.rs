use anchor_lang::prelude::*;

#[error]
pub enum ErrorCode {
    #[msg("You do not have sufficient permissions to perform this action.")]
    Unauthorized,
    #[msg("User already whitelisted.")]
    PlayerAlreadyWhitelisted,
    #[msg("User not whitelisted.")]
    PlayerNotWhitelisted,
    #[msg("Not enough invites left.")]
    NotEnoughInvitesLeft,
    #[msg("Invalid game name.")]
    InvalidGameName,
    #[msg("Game start time must be in the future.")]
    InvalidGameStartTime,
    #[msg("Game already started.")]
    GameAlreadyStarted,
    #[msg("Game not started.")]
    GameNotStarted,
    #[msg("No questions should be revealed on game creation.")]
    RevealedQuestionsOnGameCreation,
    #[msg("Game does not exist.")]
    GameDoesNotExist,
    #[msg("Question can't be revealed ahead.")]
    QuestionRevealedAhead,
    #[msg("Question does not exist.")]
    QuestionDoesNotExist,
    #[msg("Previous question wasn't answered")]
    PreviousQuestionWasNotAnswered,
    #[msg("Invalid question hash.")]
    InvalidQuestionHash,
    #[msg("Invalid question variant hash.")]
    InvalidQuestionVariantHash,
    #[msg("Question is not revealed.")]
    QuestionIsNotRevealed,
    #[msg("Question deadline exceeded.")]
    QuestionDeadlineExceeded,
    #[msg("Variant does not exist.")]
    VariantDoesNotExist,
    #[msg("Answer already revealed.")]
    AnswerAlreadyRevealed,
    #[msg("Question deadline not exceeded.")]
    QuestionDeadlineNotExceeded,
    #[msg("Questions limit reached.")]
    QuestionsLimitReached,
    #[msg("Win claiming already started.")]
    WinClaimingAlreadyStarted,
    #[msg("Win claiming should be active.")]
    WinClaimingNotActive,
    #[msg("Win already claimed for this user.")]
    WinAlreadyClaimed,
    #[msg("Answer count do not match.")]
    AnswerCountMismatch,
    #[msg("Wrong answer.")]
    WrongAnswer,
}
