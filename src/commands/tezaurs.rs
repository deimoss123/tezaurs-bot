use reqwest;
use scraper::{Html, Selector};
use serenity::{
    builder::CreateApplicationCommand,
    model::prelude::{
        command::CommandOptionType,
        interaction::{
            application_command::{ApplicationCommandInteraction, CommandDataOptionValue},
            InteractionResponseType,
        },
    },
    prelude::Context,
};

fn get_text(res: &str) {
        let fragment = Html::parse_fragment(&res);
        let div_selector = Selector::parse("#doc").unwrap();

        // TODO: ja nav tad tezaura kļūme gan jau
        let doc_div = fragment.select(&div_selector).next().unwrap();

        let exact_match_selector = Selector::parse("#exactMatch").unwrap();

        let temp = doc_div.select(&exact_match_selector).next();
        println!("{:#?}", temp);
}

pub async fn run(ctx: &Context, interaction: &ApplicationCommandInteraction) {
    let word_option = &interaction.data.options.get(0);
    let word_option = word_option.unwrap().resolved.as_ref().unwrap();

    let user_option = &interaction.data.options.get(1);

    if let CommandDataOptionValue::String(text) = word_option {
        let user_mention: String = match user_option {
            Some(opt) => match opt.resolved.as_ref().unwrap() {
                CommandDataOptionValue::User(user, _) => format!("<@{}>\n", user.id),
                _ => "".to_string(),
            },
            None => "".to_string(),
        };

        let res_text = format!("{}Ievadītais vārds: **{}**", user_mention, text);
        let url = format!("https://tezaurs.lv/api/searchEntry?w={}", text);
        println!("URL: {}", url);
        let res = reqwest::get(url).await;
        let res = if let Ok(res) = res {
            if let Ok(res) = res.text().await {
                res
            } else {
                return;
            }
        } else {
            return;
        };

        println!("{}", &res);
        get_text(&res);


        // izaicinājums - uzraksti smuku kodu rūsā (neiespējami)
        if let Err(why) = interaction
            .create_interaction_response(&ctx.http, |res| {
                res.kind(InteractionResponseType::ChannelMessageWithSource)
                    .interaction_response_data(|msg| msg.content(&res_text))
            })
            .await
        {
            println!("Couldn't respond to /tezaurs: {}", why)
        }
    }
}

pub fn register(command: &mut CreateApplicationCommand) -> &mut CreateApplicationCommand {
    return command
        .name("tezaurs")
        .description("Atrast vārda definīciju un homonīmus")
        .create_option(|option| {
            option
                .name("vārds")
                .description("Vārds ko meklēt")
                .required(true)
                .kind(CommandOptionType::String)
        })
        .create_option(|option| {
            option
                .name("lietotājs")
                .description("Lietotājs ko vēlies pieminēt (pingot)")
                .required(true)
                .kind(CommandOptionType::User)
        });
}
