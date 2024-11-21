use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
};

// Define the structure for a post's metadata
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct PostMetadata {
    title: String,
    content: String,
    image_url: String,
    author: String,
    date: String,
    others: String,
}

// Program entry point
entrypoint!(process_instruction);

// Main process instruction function
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    // The first account is the post data account to store the metadata
    let post_account = next_account_info(accounts_iter)?;

    // Ensure the post account is owned by the program
    if post_account.owner != program_id {
        msg!("Account not owned by the program");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize the instruction data into PostMetadata
    let metadata = PostMetadata::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    // Serialize and store the post metadata in the post account data
    metadata.serialize(&mut &mut post_account.data.borrow_mut()[..])?;

    msg!("Post created with title: {}", metadata.title);

    Ok(())
}
