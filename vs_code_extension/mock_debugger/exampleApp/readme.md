# Header 1
Since creating a debug adapter from scratch is a bit heavy for this tutorial, we will start with a simple debug adapter which we have created as an educational debug adapter 'starter kit'. It is called Mock Debug because it does not talk to a real debugger but it 'mocks' one. So Mock Debug simulates a debugger and supports step, continue, breakpoints, exceptions, and variable access but it is not connected to any real debugger.

Before delving into the development setup for mock-debug, let's first install a pre-built version from the VS Code Marketplace and play with it:

# Header 2
switch to the Extensions viewlet and type 'mock' to search for the Mock Debug extension,
'Install' and 'Reload' the extension.
To try Mock Debug:

# Header 3
Create a new empty folder mock test and open it in VS Code.
Create a file readme.md and enter several lines of arbitrary text.
Switch to the Debug view and press the gear icon.
VS Code will let you select an 'environment' in order to create a default launch configuration. Pick "Mock Debug".
Press the green Start button and then Enter to confirm the suggested file 'readme.md'.
A debug session starts and you can 'step' through the readme file, set and hit breakpoints, and run into exceptions (if the word exception appears in a line).