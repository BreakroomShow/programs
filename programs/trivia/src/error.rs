use anchor_lang::prelude::*;

#[error]
pub enum ErrorCode {
    #[msg("You do not have sufficient permissions to perform this action.")]
    Unauthorized,
    #[msg("Invalid game name.")]
    InvalidGameName,
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
    #[msg("Question not finished.")]
    QuestionNotFinished,
}
