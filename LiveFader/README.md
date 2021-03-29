## Development

1. Run `yarn watch`

## Distributing

Ensure all dist files are in project (click Show Containing Project icon)

Save frozen project to a different filename and don't unfreeze it as the unfrozen JS files take precendence over the dist ones

## Caveats

- No subdirectories
- LiveAPI observers leak when hot reloading
- Hot reloading can be dodgy: reload js by "renaming" live object, or destroy + reload live device
