import * as core from '@actions/core'
import * as github from '@actions/github'
import { components } from '@octokit/openapi-types/types'

async function run(): Promise<void> {
    // Get input values
    const myToken = core.getInput('myToken');
    const excludeReleaseTypes = core.getInput('exclude_types').split('|');
    const topList = +core.getInput('view_top');
    const ghRef = core.getInput('ghRef');

    // Set parameters
    const excludeDraft = excludeReleaseTypes.some(f => f === "draft");
    const excludePrerelease = excludeReleaseTypes.some(f => f === "prerelease");
    const excludeRelease = excludeReleaseTypes.some(f => f === "release");

    const octokit = github.getOctokit(myToken);

    // Load release list from GitHub
    let releaseList = await octokit.rest.repos.listReleases({
        repo: github.context.repo.repo,
        owner: github.context.repo.owner,
        per_page: topList,
        page: 1
    });

    // Search release list for latest required release
    if (core.isDebug()) {
        core.debug(`Debugdebug...why....`);
        core.debug(`Found ${releaseList.data.length} releases`);
        releaseList.data.forEach((el) => WriteDebug(el));
    }

    for (let i = 0; i < releaseList.data.length; i++) {
        let releaseListElement = releaseList.data[i];

        if ((!excludeDraft && releaseListElement.draft) ||
            (!excludePrerelease && releaseListElement.prerelease) ||
            (!excludeRelease && !releaseListElement.prerelease && !releaseListElement.draft) && (!ghRef.find(releaseListElement.tag_name))) {
            core.debug(`Chosen: ${releaseListElement.id}`);
            core.debug(`ghRef: ${ghRef} tag: ${releaseListElement.tag_name}`);
            setOutput(releaseListElement);
            break;
        }
    }
}

/**
 * Setup action output values
 * @param release - founded release
 */
function setOutput(release: components["schemas"]["release"]): void {
    core.setOutput('id', release.id);
    core.setOutput('name', release.name);
    core.setOutput('tag_name', release.tag_name);
    core.setOutput('created_at', release.created_at);
    core.setOutput('draft', release.draft);
    core.setOutput('prerelease', release.prerelease);
    core.setOutput('release', !release.prerelease && !release.draft);
    core.setOutput('url', release.url);
    core.setOutput('assets_url', data.assets_url);
    if(ghRef.startsWith('refs/tags/')
        core.setOutput(release.html_url.substr(0,lastIndexOf('/'))+ghRef.substr(9));
    else
        core.setOutput('html_url', release.html_url);
}

/**
 * Write debug
 * @param release - founded release
 */
function WriteDebug(release: components["schemas"]["release"]): void {
    core.debug(`id: ${release.id}`);
    core.debug(`name: ${release.name}`)
    core.debug(`tag_name: ${release.tag_name}`);
    core.debug(`created_at: ${release.created_at}`);
    core.debug(`draft: ${release.draft}`);
    core.debug(`prerelease: ${release.prerelease}`);
    core.debug(`url: ${release.url}`)
    core.debug(`assets_url: ${release.assets_url}`)
    core.debug(`html_url: ${release.html_url}`)
}

run();
