import re

def process_file():
    with open('src/scenes/Intro/IntroScene.tsx', 'r') as f:
        content = f.read()

    # Define a helper function to replace the logic block for a given planet
    def replace_block(content, prefix, progress_var, target_var, final_offset_var, turn_from_var, offset_at_pullback_var, approach_var, is_moon=False):
        # We need to find the if-else block
        
        if is_moon:
            old_p = r"const p1 = 0\.10; // Pull back\n\s*const p2 = 0\.25; // Turn to Moon\n\s*const p3 = 0\.70; // Travel to Moon"
            new_p = f"const p1 = 0.10; // Pull back\n      const p2 = 0.25; // Turn to {prefix}\n      const p3 = 0.45; // Travel to {prefix}\n      const p4 = 0.60; // Arrive at final offset"
            
            old_if = (r"if \(" + progress_var + r" < p1\) \{\n"
                      r"(.*?)\} else if \(" + progress_var + r" < p2\) \{\n"
                      r"(.*?)\} else if \(" + progress_var + r" < p3\) \{\n"
                      r"(.*?)\} else \{\n"
                      r"(.*?)\}")
            
        else:
            old_p = r"const p1 = 0\.15; // Pull back from [^\n]*\n\s*const p2 = 0\.35; // Turn to [^\n]*\n\s*const p3 = 0\.75; // Travel to [^\n]*"
            new_p = f"const p1 = 0.10; // Pull back\n      const p2 = 0.25; // Turn to {prefix}\n      const p3 = 0.45; // Travel to {prefix}\n      const p4 = 0.60; // Arrive at final offset"

            old_if = (r"if \(" + progress_var + r" < p1\) \{\n"
                      r"(.*?)\} else if \(" + progress_var + r" < p2\) \{\n"
                      r"(.*?)\} else if \(" + progress_var + r" < p3\) \{\n"
                      r"(.*?)\} else \{\n"
                      r"(.*?)\}")
        
        # We need a custom replacement for the if block
        # The structure is standard:
        # if < p1 (pullback), else if < p2 (turn), else if < p3 (travel), else (swoop in)
        # We want to change it to:
        # if < p1, else if < p2, else if < p3, else if < p4, else (drift)
        
        # Let's extract the actual bodies using non-greedy match
        match = re.search(old_if, content, re.DOTALL)
        if not match:
            print(f"Could not find if block for {prefix}")
            return content
        
        body1 = match.group(1)
        body2 = match.group(2)
        body3 = match.group(3)
        body4 = match.group(4)
        
        # Body 3 was:
        # const subP = (prog - p2) / (p3 - p2);
        # const ease = gsap.parseEase('power2.inOut')(subP);
        # currentTarget.copy(visualTarget);
        # currentOffset.lerpVectors(offsetAtPullbackLookingAt..., approachOffset, ease);
        
        # Body 4 (swoop in) was:
        # const subP = (prog - p3) / (1 - p3);
        # const ease = gsap.parseEase('power3.out')(subP);
        # currentTarget.copy(visualTarget);
        # currentOffset.lerpVectors(approachOffset, finalOffset, ease);
        
        # We need to rewrite Body 4 to use p4 instead of 1, and add Body 5
        
        new_body4 = (f"        const subP = ({progress_var} - p3) / (p4 - p3);\n"
                     f"        const ease = gsap.parseEase('power3.out')(subP);\n"
                     f"        currentTarget.copy({target_var});\n"
                     f"        currentOffset.lerpVectors({approach_var}, {final_offset_var}, ease);\n      ")
                     
        new_body5 = (f"        const subP = ({progress_var} - p4) / (1 - p4);\n"
                     f"        currentTarget.copy({target_var});\n"
                     f"        const driftOffset = {final_offset_var}.clone().multiplyScalar(0.95);\n"
                     f"        currentOffset.lerpVectors({final_offset_var}, driftOffset, subP);\n      ")
                     
        new_if = (f"if ({progress_var} < p1) {{\n{body1}"
                  f"}} else if ({progress_var} < p2) {{\n{body2}"
                  f"}} else if ({progress_var} < p3) {{\n{body3}"
                  f"}} else if ({progress_var} < p4) {{\n{new_body4}"
                  f"}} else {{\n{new_body5}}}")
        
        content = re.sub(old_p, new_p, content, count=1)
        content = content.replace(match.group(0), new_if)
        
        return content
        
    content = replace_block(content, 'Moon', 'moonProgress', 'moonVisualTarget', 'finalMoonOffset', 'earthPosition', 'offsetAtPullbackLookingAtMoon', 'approachOffset', is_moon=True)
    content = replace_block(content, 'Mars', 'marsProgress', 'marsPosition', 'finalMarsOffset', 'moonVisualTarget', 'offsetAtPullbackLookingAtMars', 'approachOffset')
    content = replace_block(content, 'Jupiter', 'jupiterProgress', 'jupiterVisualTarget', 'finalJupiterOffset', 'marsPosition', 'offsetAtPullbackLookingAtJupiter', 'approachOffset')
    content = replace_block(content, 'Saturn', 'saturnProgress', 'saturnVisualTarget', 'finalSaturnOffset', 'jupiterVisualTarget', 'offsetAtPullbackLookingAtSaturn', 'approachOffset')
    content = replace_block(content, 'Uranus', 'uranusProgress', 'uranusVisualTarget', 'finalUranusOffset', 'saturnVisualTarget', 'offsetAtPullbackLookingAtUranus', 'approachOffset')
    
    with open('src/scenes/Intro/IntroScene.tsx', 'w') as f:
        f.write(content)

process_file()
