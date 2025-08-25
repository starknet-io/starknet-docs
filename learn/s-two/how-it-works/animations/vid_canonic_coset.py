from settings import *

SIZE = 8

class Video(Scene):
    def construct(self):
        configure(self)

        self.add(grid)
        self.add(grid.get_axis_labels().set_color(COLOR_AXIS_LABELS))
        self.add(unit_circle)

        space =  FULL/SIZE

        angles = [0.0]

        while len(angles) < SIZE:
            angles.append(angles[-1] + space)

        delta = ValueTracker(0)

        def new_dot(angle, color, z=0):
            dot = Dot(angle_to_coords(angle), color=color)
            dot.set_z_index(z)
            return dot

        def line_between(angle1, angle2, color, z=0):
            line = Line(angle_to_coords(angle1), angle_to_coords(angle2), color=color)
            line.set_z_index(z)
            return line

        angle_pairs = [(angles[i], angles[i+1]) for i in range(len(angles)-1)]
        angle_pairs.append((angles[-1], angles[0]))

        dots_plus = [auto(
            lambda angle=angle:
                new_dot(
                    angle + delta.get_value(),
                    color=PURPLE_E,
                    z=2
                )
            ) for angle in angles]

        lines_plus = [auto(
            lambda angle1=angle1, angle2=angle2:
                line_between(
                    angle1 + delta.get_value(),
                    angle2 + delta.get_value(),
                    PURPLE_E,
                    z=2
                )
            ) for angle1, angle2 in angle_pairs
        ]

        for dot in dots_plus:
            self.play(
                Create(dot),
                run_time=0.4
            )

        self.play(
            *[Create(line) for line in lines_plus],
        )

        self.wait(4)

        rad_line = auto(lambda: radian_line(delta.get_value()))

        self.play(
            Create(rad_line)
        )

        self.wait()

        self.play(
            delta.animate.set_value(PI/8),
            run_time=4,
        )

        self.wait(4)

        self.play(
            *[Uncreate(x) for x in lines_plus + [rad_line]],
            run_time=2,
        )

        self.wait(2)

        self.play(
            *[Uncreate(x) for x in dots_plus],
            run_time=2,
        )
