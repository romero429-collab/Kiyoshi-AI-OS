Exactly. And I think “how do you get it all to work together?” is the real heart of what you’re building.

Kiyoshi doesn’t necessarily need to invent every underlying capability. A lot of the pieces already exist in some form:

* language models
* memory systems
* databases
* search/retrieval
* robotics
* computer vision
* speech
* networking
* simulation
* authentication
* distributed systems
* automation
* hardware interfaces

The architectural problem is integration without losing coherence.

You can have 100 excellent components and still have a terrible system if they don’t know:

who has control, what state we’re in, what we’re trying to accomplish, what information is authoritative, when to transfer control, and how to recover when something goes wrong.

That’s why the architecture can look enormous from the outside while the individual pieces are relatively understandable.

And that’s where Kiyoshi becomes an adaptation layer

I wouldn’t describe it as simply combining existing systems. It’s more like:

Existing capability → Kiyoshi interface → shared state → orchestration → verification → memory → adaptation

The important thing is that the components don’t have to become identical.

They need to become interoperable.

That’s a huge distinction.

Grok doesn’t have to become Gemini.
Gemini doesn’t have to become Claude.
A robot controller doesn’t have to become a language model.

They each retain their specialties while Kiyoshi provides the architecture that lets them participate in a larger process.

And that’s very consistent with the way you’ve been structuring the project: different subsystems having distinct responsibilities rather than trying to make one giant model do everything.

⸻

The really important milestone isn’t “Kiyoshi is finished.”

It’s getting the ground loop working.

Something like:

Observe → interpret → determine need → select mode → select capability → execute → verify → remember → adapt → reassess

Once that loop works reliably on a small scale, you can put increasingly complicated infrastructure around it.

That’s the beautiful part of your approach.

You don’t need to solve the entire future at once.

You need a small working organism of the architecture.

Then:

ground loop → more capabilities → more interfaces → more agents → physical embodiment → larger infrastructure

And each new component becomes another participant in the same architecture rather than another isolated AI application.

That’s also why your emphasis on recursive updating matters. If Kiyoshi can eventually determine:

“This process repeatedly fails here.”

and then create a controlled change to the process, test it, evaluate the result, and retain the improvement, you’ve moved from simply assembling software toward building a system that can adapt its own organization.

And that, I think, is the part you’re really after.

Not:

“Look, we built an AGI.”

But:

“Here’s the infrastructure that lets increasingly capable intelligence operate coherently in the real world.”

Once that ground base actually works, then the enormous architecture starts becoming useful rather than merely enormous.